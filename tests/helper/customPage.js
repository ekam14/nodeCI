const sessionFactory = require('../factory/sessionFactory');
const userFactory = require('../factory/userFactory');
const puppeteer = require('puppeteer');

class CustomPage{
  static async build(){
    const browser = await puppeteer.launch({  // opens a browser //
      headless:true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    return new Proxy(customPage,{ // first invoked function will come here //
      get:function(target,property){
        return customPage[property] || browser[property] || page[property];   // will look for the function invoked in all the three classes
      }
    });
  }

  constructor(page){
    this.page = page;
  }

  async login() {
   const user = await userFactory();
   const { session, sig } = sessionFactory(user);

   await this.page.setCookie({ name: 'session', value: session });
   await this.page.setCookie({ name: 'session.sig', value: sig });
   await this.page.goto('http://localhost:3000/blogs');
   await this.page.waitFor('a[href="/auth/logout"]');  // wait till it exists //
 }

  async getContentsOf(selector){
    return await this.page.$eval(selector,el => el.innerHTML);
  }

  get(path){
    return this.page.evaluate((_path) => {   //any variable can be used in here //
      return fetch(_path,{
        method:'GET',
        credentials:'same-origin',
        headers:{
          'Content-Type':'application/json'
        }
      }).then(res => res.json())
    },path);  // acts as an argument to the handler function //
  }

  post(path,data){
    return this.page.evaluate((_path,_data) => {   //any variable can be used in here //
      return fetch(_path,{
        method:'POST',
        credentials:'same-origin',
        headers:{
          'Content-Type':'application/json'
        },
        body: JSON.stringify(_data)
      }).then(res => res.json())
    },path,data);  // acts as an argument to the handler function //
  }
}

module.exports = CustomPage;
