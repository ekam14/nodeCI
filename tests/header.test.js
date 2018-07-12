const Page = require('./helper/customPage');

let page;

beforeEach(async () => {
  page =await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

test('We can launch a browser',async () => {
  const text = await page.getContentsOf('a.brand-logo');
  expect(text).toEqual('Blogster');
});

test("clicking login starts oauth flow",async () => {
  await page.click('.right a');  // for clicking the right most button //
  const url = page.url();  // for the frame URL //
  expect(url).toMatch(/accounts\.google\.com/);
});

test("When signed in,logout button must appear.",async () => {
  await page.login();

  var text = await page.$eval('a[href="/auth/logout"]',el => el.innerHTML);
  expect(text).toEqual('Logout');
});
