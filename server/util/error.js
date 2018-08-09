/**
* @Author: Jet.Chan
* @Date:   2016-11-24T16:22:16+08:00
* @Email:  guanjie.chen@talebase.com
* @Last modified by:   Jet.Chan
* @Last modified time: 2017-02-21T16:49:06+08:00
***************************************************************
定义常用的错误类型
***************************************************************
*/

class ApiRequestError extends Error {
    constructor(message) {
        super(message);
        this.type = 'ApiRequestError';
    }
};

class DBError extends Error {
    constructor(message) {
        super(message);
        this.type = 'DBError';
    }
};

class PageError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.type = 'PageError';
        this.status = status;
    }
}

class CodeException extends Error {
    constructor(message) {
        super(message);
        this.type = 'CodeException';
    }
}


class DataException extends Error {
    constructor(message, data) {
        super(message);
        this.type = 'CodeException';
        this.data = data;
    }
}

export {
    ApiRequestError,
    DBError,
    PageError,
    CodeException,
    DataException
};
