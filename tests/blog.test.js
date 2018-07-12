const Page = require('./helper/customPage');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close();
});

describe('When logged in',async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });
  test('can see the blog form',async () => {
    const labelTitle = await page.getContentsOf('form label');
    const labelContent = await page.getContentsOf('.content label');

    expect(labelTitle).toEqual('Blog Title');
    expect(labelContent).toEqual('Content');
  });

  describe('And using valid inputs',async() => {
    beforeEach(async() => {
      await page.type('.title input','This is a Blog Title');
      await page.type('.content input','Random content');
      await page.click('form button');
    });

    test('review the blog',async() => {
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('can see the saved blog',async() => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentsOf('.card-content .card-title');
      const content = await page.getContentsOf('.card-content p');

      expect(title).toEqual('This is a Blog Title');
      expect(content).toEqual('Random content');
    });
  });

  describe('And using invalid inputs',async() => {
    beforeEach(async() => {
      await page.click('form button');
    });
    test('the form shows an error message',async () => {
      const titleErr = await page.getContentsOf('.title .red-text');
      const contentErr = await page.getContentsOf('.content .red-text');

      expect(titleErr).toEqual('You must provide a value');
      expect(contentErr).toEqual('You must provide a value');
    });
  });
});

describe('When user is not logged in',async() => {

  test('User cannot post a new blog',async() => {
    const result = await page.post('/api/blogs',{title:"T",content:"c"});
    expect(result).toEqual( {error:'You must log in!' });
  });

  test('User cannot get a list of blogs',async() => {
    const result = await page.get('/api/blogs');

    expect(result).toEqual( {error:'You must log in!' });
  });

});
