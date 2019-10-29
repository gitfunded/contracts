export default class ExchangeRateApi {

    COIN_MARKET_CAP_SERVER = "https://min-api.cryptocompare.com/data/price?fsym=USD";
    TOKEN = '850e44c9a54ead0911c6a29a31960e2af151cc649bd992b1a29315f00c13e237';

    fetchEtherPrice(amount) {

        return fetch(
            this.COIN_MARKET_CAP_SERVER + "&tsyms=ETH" ,
            {
                method: 'GET',
                headers: {

                    'Authorization': this.TOKEN
                }


            }).then(res => res.json())
            .then(function (response) {
            return response['ETH'] * amount ;
        }).catch(function (error) {
            console.log(error);
            return { meta:{ status: false, message: error } };
        });


    }





}

module.export = ExchangeRateApi;
