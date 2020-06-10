const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://gamefaqs.gamespot.com/';

const browserHeaders = {
 
'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
'accept-encoding': 'gzip, deflate, br',
'accept-language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
'cache-control': 'max-age=0',
'cookie': 'gf_dvi=ZjVlZTEyOTUzMDBiMzE0MDMzZGVmNzJhYWQ4Yzg5MWQ1YjllNjQ2M2Y0MzJlNGYxYjI5YWNlMDE0M2ZkNWVlMTI5NTM%3D; gf_geo=MjgwNDoyMTQ6ODVkNTo0Y2M3OjJkOTI6MmEyMjoxMzc4OjY0Yzc6NzY6MTAxMjE%3D; fv20200611=1; dfpsess=e; XCLGFbrowser=XluLqV7hKV%2BkNSLUV6w; LDCLGFbrowser=47744483-e8c7-4e25-a6ea-008d6c741864; __utma=132345752.1984752801.1591814496.1591814496.1591814496.1; __utmb=132345752.0.10.1591814496; __utmc=132345752; __utmz=132345752.1591814496.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); s_vnum=1594406496425%26vn%3D1; s_invisit=true; s_lv_gamefaqs_s=First%20Visit; AMCVS_10D31225525FF5790A490D4D%40AdobeOrg=1; trc_cookie_storage=taboola%2520global%253Auser-id%3D40d0a1da-3d0d-4e56-b5ea-b031d4dcdacf-tuct4b5de97; s_ecid=MCMID%7C67462496326263445623080633208284394838; s_cc=true; AMCV_10D31225525FF5790A490D4D%40AdobeOrg=1585540135%7CMCIDTS%7C18424%7CvVersion%7C4.4.0%7CMCMID%7C67462496326263445623080633208284394838%7CMCAAMLH-1592419298%7C4%7CMCAAMB-1592419298%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1591821701s%7CNONE%7CMCAID%7CNONE; aamgam=segid%3D17888825; aam_uuid=67579203352153474663068940800344453166; __gads=ID=4e2dff3c516add81:T=1591814502:S=ALNI_MZsvVDy118pR0kw5nE7y7pgj4wqDg; spt=no; __qca=P0-340974103-1591814543092; RT="z=1&dm=gamespot.com&si=t1guhrtbxh&ss=kb9p8tmu&sl=0&tt=0"; OptanonConsent=isIABGlobal=false&datestamp=Wed+Jun+10+2020+15%3A49%3A19+GMT-0300+(Hor%C3%A1rio+Padr%C3%A3o+de+Bras%C3%ADlia)&version=6.1.0&consentId=4700fd94-fe53-4a9c-b1f9-d27f2243a3eb&interactionCount=0&landingPath=NotLandingPage&groups=1%3A1%2C2%3A1%2C3%3A1%2C4%3A1%2C5%3A1&hosts=&legInt=&AwaitingReconsent=false&geolocation=BR%3BCE; OptanonAlertBoxClosed=2020-06-10T18:49:19.107Z; s_getNewRepeat=1591814959188-New; s_lv_gamefaqs=1591814959189; s_sq=%5B%5BB%5D%5D; RT="z=1&dm=gamefaqs.gamespot.com&si=184a9407-63b2-4f90-89a9-b070b7c65126&ss=kb9p8tmu&sl=h&tt=1it6&obo=6&bcn=%2F%2F17d09915.akstat.io%2F"; QSI_HistorySession=https%3A%2F%2Fgamefaqs.gamespot.com%2Fps%2Fcategory%2F999-all%3Fpage%3D9~1591814663079%7Chttps%3A%2F%2Fgamefaqs.gamespot.com%2Fps%2Fcategory%2F999-all%3Fpage%3D8~1591814675425%7Chttps%3A%2F%2Fgamefaqs.gamespot.com%2Fps%2Fcategory%2F999-all%3F~1591814699970%7Chttps%3A%2F%2Fgamefaqs.gamespot.com%2Fps%2Fcategory%2F999-all%3Fpage%3D1~1591814973909',
'sec-fetch-mode': 'navigate',
'sec-fetch-site': 'none',
'sec-fetch-user': '?1',
'upgrade-insecure-requests': '1',
'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Mobile Safari/537.36'
};

const slug = (str) => {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
  
    // remove accents, swap ñ for n, etc
    var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to   = "aaaaaeeeeiiiioooouuuunc------";

    for (var i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}


const writeToFile = (data, filename) => {
    const promisseCallback = (resolve, reject) => {
        fs.writeFile(filename, data, (error)=> {
            if (error) {
                reject(error);
                return;
            }
            resolve(true);
        });
    };
    return new Promise(promisseCallback);
};

const readFromFile = (filename) => {
    const promisseCallback = (resolve) => {
        fs.readFile(filename, 'utf8', (error, contents) => {
            if (error) { 
                resolve(null);
                return;
            }
            resolve(contents);
        });
    };
    
    return new Promise(promisseCallback);
};

const getPage = (path) => {
  
    const url = `${BASE_URL}${path}`;
    const options = {
        headers: browserHeaders
    };

    return axios.get(url, options).then((response) => response.data);

};

const getCachedPage = (path) => {
    
    const filename = `cache/${slug(path)}.html`;
    const promisseCallback = async (resolve, reject) => {
        const cachedHTML = await readFromFile(filename);
      
        if (!cachedHTML) {
            const html = await getPage(path);
            await writeToFile(html, filename);
            resolve(html);
            return;
        }
        resolve(cachedHTML);
    };
    
    return new Promise(promisseCallback);
};

const saveData = (data, path) => {
    
    const promisseCallback = async (resolve, reject) => {
        if (!data || data.length === 0) return resolve(true);
        const dataToStore = JSON.stringify({data: data}, null, 2);
        const created = await writeToFile(dataToStore, path);
        resolve(true);
    };

    return new Promise(promisseCallback)
};

const getPageItems = (html) => {
    const $ = cheerio.load(html);
    const promisseCallback = (resolve, reject) => {
        const selector =  '#content > div.post_content.row > div > div:nth-child(1) > div.body > table > tbody > tr';
        
        const games = [];
        $(selector).each((i, element) => {
            const a = $('td.rtitle > a', element);
            const title = a.text();
            const href = a.attr('href');
            const id = href.split('/').pop();
            games.push({id, title, path: href});
        });

        resolve(games);
    };
    return new Promise(promisseCallback);
};

const getAllPage = async (start, finish) => {
    let page = start;
    do {
        const path = `/ps/category/999-all?page=${page}`;
        console.log(path);
        await getCachedPage(path)
            .then(getPageItems)
            .then((data) => saveData(data, `./pages/db-${page}.json`))
            .then(console.log)
            .catch(console.error);
        page++;
    } while (page < finish);
}

getAllPage(0, 10);