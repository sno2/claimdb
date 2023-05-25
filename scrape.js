import fs from "fs/promises";
import puppeteer from "puppeteer";

async function loadOpenClaims(page, initial, out) {
  let next = initial;

  while (next) {
    console.log(next);
    await page.goto(
      next,
      {
        waitUntil: "domcontentloaded",
      },
    );

    const data = await page.evaluate(() => {
      const els = document.querySelectorAll(".reveal-modal");
      const results = [];

      for (const el of els) {
        const name = el.querySelector("h2 a")?.textContent.replace(/»/g, "")
          .replace(/\s+/, " ")
          .trim();
        const defendant = el.querySelector(".grey-note")?.childNodes?.[1]
          ?.textContent.trim();
        const description = el.querySelector("p:nth-of-type(2)").textContent;
        const linkEl = el.querySelector(
          "div > p:nth-child(4)",
        );
        const link = linkEl.querySelector("a")?.href;
        const s = linkEl?.textContent.replace(
          /(.* is )/,
          "",
        ).replaceAll(".", "").trim();
        const deadline = new Date(s);

        results.push({
          location: "United States",
          name,
          defendant,
          description,
          link,
          deadline: deadline.toISOString(),
          source: 0,
          status: 0,
        });
      }

      const nextEl = document.querySelector(
        ".page-next",
      );

      return {
        results,
        next: nextEl?.href,
      };
    });

    out.push(...data.results);
    next = data.next;
  }
}

async function loadPendingClaims(page, initial, out) {
  let next = initial;

  while (next) {
    console.log(next);
    await page.goto(
      next,
      {
        waitUntil: "domcontentloaded",
      },
    );

    const data = await page.evaluate(() => {
      const els = document.querySelectorAll(".reveal-modal");
      const results = [];

      for (const el of els) {
        const name = el.querySelector("h2 a")?.textContent.replace(/»/g, "")
          .replace(/\s+/, " ")
          .trim();
        const defendant = el.querySelector(".grey-note")?.childNodes?.[1]
          ?.textContent.trim();
        const description = el.querySelector("p:nth-of-type(2)").textContent;
        const linkEl = el.querySelector(
          "div > p:last-of-type > a",
        );
        const link = linkEl?.href;
        // const s = linkEl?.textContent.replace(
        //   /(.* is )/,
        //   "",
        // ).replaceAll(".", "").trim();
        // const deadline = new Date(s);

        results.push({
          location: "United States",
          name,
          defendant,
          description,
          link,
          //   deadline: deadline.toISOString(),
          source: 0,
          status: 1,
        });
      }

      const nextEl = document.querySelector(
        ".page-next",
      );

      return {
        results,
        next: nextEl?.href,
      };
    });

    out.push(...data.results);
    next = data.next;
  }
}

async function loadClosedClaims(page, initial, out) {
  let next = initial;

  while (next) {
    console.log(next);
    await page.goto(
      next,
      {
        waitUntil: "domcontentloaded",
      },
    );

    const data = await page.evaluate(() => {
      const els = document.querySelectorAll(".reveal-modal");
      const results = [];

      for (const el of els) {
        const name = el.querySelector("h2 a")?.textContent.replace(/»/g, "")
          .replace(/\s+/, " ")
          .trim();
        const defendant = el.querySelector(".grey-note")?.childNodes?.[1]
          ?.textContent.trim();
        const description = el.querySelector("p:nth-of-type(2)").textContent;
        const linkEl = el.querySelector(
          "div > p:last-of-type > a",
        );
        const link = linkEl?.href;

        results.push({
          location: "United States",
          name,
          defendant,
          description,
          link,
          source: 0,
          status: 2,
        });
      }

      const nextEl = document.querySelector(
        ".page-next",
      );

      return {
        results,
        next: nextEl?.href,
      };
    });

    out.push(...data.results);
    next = data.next;
  }
}

async function main() {
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  const claims = [];

  const page = await browser.newPage();

  await loadOpenClaims(
    page,
    "https://www.consumer-action.org/lawsuits/by-status/open/P0",
    claims,
  );

  await loadPendingClaims(
    page,
    "https://www.consumer-action.org/lawsuits/by-status/pending/P0",
    claims,
  );

  await loadClosedClaims(
    page,
    "https://www.consumer-action.org/lawsuits/by-status/closed/P0",
    claims,
  );

  await fs.writeFile(
    "data.json",
    JSON.stringify({
      timeUpdated: new Date().toISOString(),
      actions: claims,
    }).replace(/’/g, "'").replace(/[“”]/g, '\\"').replace(/ /g, " ").replace(
      /\s+/,
      " ",
    ),
  );

  await page.close(false);
  await browser.close();
}

main();
