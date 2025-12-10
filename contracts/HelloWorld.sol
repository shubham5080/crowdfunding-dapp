// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public message;

    constructor(string memory _msg) {
        message = _msg;
    }

    function setMessage(string memory _msg) public {
        message = _msg;
    }
}


