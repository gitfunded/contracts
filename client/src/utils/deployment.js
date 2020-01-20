import {networks} from "../constants/config";

export default class Deployment {

    getActiveNetworks(amount) {

        let activeNetworks = [];
        networks.forEach((network) => {
            if(network.deployed)
            {
                activeNetworks.push(network);
            }

        });

        return activeNetworks;
    }
}

module.export = Deployment;
