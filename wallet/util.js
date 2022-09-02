const { ethers } = require("ethers");
const MobileDetect = require("mobile-detect");

const parseEther = (value) => {
     return ethers.utils.parseEther(value).toString();
}

const shortAddress = (address) => {
     let addressLen = address.length;
     return address.substring(0, 5)+"..."+address.substring(addressLen-4);
}

const device = () => {
     let mobileDetect = new MobileDetect(window.navigator.userAgent);
     return mobileDetect;
}

export {
     parseEther,
     shortAddress,
     device
}