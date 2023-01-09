const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const hbs = require("handlebars");
const path = require("path");

const data = {
  name: "Warren Harding",
  address: "1921 State St. #29 Camarillo, CA 93010",
  billingPeriod: "Oct 28, 2022 - Nov 29, 2022",
  dueDate: "Dec 27, 2022",
  invoice: "00050",
  totalDue: "$103.18",
  billBeforeSolar: "$112.71",
  totalSaving: "$9.53",
  moneytreeCharges: "$85.74",
  utilityCharges: "$17.44",
  solarPower: "78.5%",
  gridPower: "21.5%",
  ratePlan: "Time of Use 4-9pm",
  utility: "Southern California Edison",
  generation: "Clean Power Alliance",
  kwhUsed: "3835",
  co2EmissionsAvoided: "1967",
  plantedTrees: "4.5",

  /* images can't be directly accessed from local file system, 
  apparently there is a few options to workaround this (https://github.com/puppeteer/puppeteer/issues/1643)
  currently using the 'encode images as inline html' option
  */
  logo: `data:image/svg+xml;base64,${fs
    .readFileSync("./templates/Brand.svg")
    .toString("base64")}`,
  lightning: `data:image/svg+xml;base64,${fs
    .readFileSync("./templates/lightning.svg")
    .toString("base64")}`,
  cart: `data:image/svg+xml;base64,${fs
    .readFileSync("./templates/cart.svg")
    .toString("base64")}`,
  tree: `data:image/svg+xml;base64,${fs
    .readFileSync("./templates/tree.svg")
    .toString("base64")}`,
  background: `data:image/svg+xml;base64,${fs
    .readFileSync("./templates/bacground.svg")
    .toString("base64")}`,
  logoFooter: `data:image/svg+xml;base64,${fs
    .readFileSync("./templates/Brand-white.svg")
    .toString("base64")}`,
};

const compile = async function (templateName, data) {
  const filePath = path.join(process.cwd(), "templates", `${templateName}.hbs`);
  const html = await fs.readFile(filePath, "utf-8");
  return hbs.compile(html)(data);
};

(async function () {
  console.log("started");
  try {
    const content = await compile("emptyTemplate", data);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    //Next line commands puppeter to wait for external dependencies to be loaded
    await page.goto(`data:text/html;charset=UTF-8,${content}`, {
      waitUntil: "networkidle0",
    });
    await page.setContent(content);
    await page.emulateMediaType("print");
    await page.pdf({
      path: "demo.pdf",
      format: "A4",
      printBackground: true,
    });
    console.log("done");
    await browser.close();
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit();
  }
})();
