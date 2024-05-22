const userService= require('../services/userService');

exports.signup = async function (req, res) {
    try {
        let result = await userService.signup(req);
        if (result.status) return res.status(200).send({ status: true, data: result.data });
        return res.status(result.code).send({ status: false, msg: result.msg });
    } catch (e) {
        return res.status(500).send({ status: false, msg: e.msg});
    }
};

exports.signin = async function (req, res) {
    try {
        let result = await userService.signin(req);
        if (result.status) return res.status(200).send({ status: true, data: result.data });
        return res.status(result.code).send({ status: false, msg: result.msg });
    } catch (e) {
        return res.status(500).send({ status: false, msg: e.msg });
    }
};

exports.signout = async function (req, res) {
    try {
        let result = await userService.signout(req);
        if (result.status) return res.status(200).send({ status: true, data: result.msg });
        return res.status(result.code).send({ status: false, msg: result.msg });
    } catch (e) {
        return res.status(500).send({ status: false, msg: e.msg });
    }
};

exports.confirmEmail = async function (req, res) {
    try {
        let result = await userService.confirmEmail(req);
        if (result.status) return res.status(200).send({ status: true, data: result.msg });
        return res.status(result.code).send({ status: false, msg: result.msg });
    } catch (e) {
        return res.status(500).send({ status: false, msg: e.msg});
    }
};

exports.forgotPassword = async function (req, res) {
    try {
        let result = await userService.forgotPassword(req);
        if (result.status) return res.status(200).send({ status: true, data: result.msg });
        return res.status(result.code).send({ status: false, msg: result.msg });
    } catch (e) {
        return res.status(500).send({ status: false, msg: e.msg});
    }
};

exports.resetPassword = async function (req, res) {
    try {
        let result = await userService.resetPassword(req);
        if (result.status) return res.status(200).send({ status: true, data: result.msg });
        return res.status(result.code).send({ status: false, msg: result.msg });
    } catch (e) {
        return res.status(500).send({ status: false, msg: e.msg});
    }
};
