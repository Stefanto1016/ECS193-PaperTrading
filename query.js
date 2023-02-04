const client_id = "Y9RUBZ5ISBYWMTOQOMGYS5N6K1Y32HXK";
const account_number = '1';
const password = '1';

var data;


const company = "GOOG";
const queryType = "quotes";
const url = `https://api.tdameritrade.com/v1/marketdata/${company}/${queryType}?`;
const params = new URLSearchParams({apikey: client_id});

data = fetch(url + params).then(response => response.json().then(json => console.log(json['GOOG']['askPrice'])));





