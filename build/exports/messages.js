"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMessage = void 0;
const extractMessage = (riko) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
    if (!riko || riko.message) {
        return {
            media: undefined,
            mentions: [],
            fullMessages: "",
            from: undefined,
            isCommand: false,
            commandName: "",
            args: [],
            userName: undefined,
            userRole: undefined,
            partipant: undefined,
        };
    }
    const from = ((_a = riko.key) === null || _a === void 0 ? void 0 : _a.remoteJid) || "Remetente desconhecido";
    const textMessage = ((_b = riko.message) === null || _b === void 0 ? void 0 : _b.conversation) || "";
    const extendedTextMessage = ((_d = (_c = riko.message) === null || _c === void 0 ? void 0 : _c.extendedTextMessage) === null || _d === void 0 ? void 0 : _d.text) || ((_e = riko.message) === null || _e === void 0 ? void 0 : _e.extendedTextMessage.text) || "";
    const imageMessage = ((_g = (_f = riko.message) === null || _f === void 0 ? void 0 : _f.imageMessage) === null || _g === void 0 ? void 0 : _g.caption) || "";
    const videoMessage = ((_j = (_h = riko.message) === null || _h === void 0 ? void 0 : _h.videoMessage) === null || _j === void 0 ? void 0 : _j.caption) || "";
    const quotedMessage = ((_o = (_m = (_l = (_k = riko.message) === null || _k === void 0 ? void 0 : _k.extendedTextMessage) === null || _l === void 0 ? void 0 : _l.cotextInfo) === null || _m === void 0 ? void 0 : _m.quotedMessage) === null || _o === void 0 ? void 0 : _o.conversation) || "";
    const fullMessage = textMessage || extendedTextMessage || imageMessage || videoMessage || quotedMessage;
    const mentions = (_q = (_p = riko.message) === null || _p === void 0 ? void 0 : _p.extendedTextMessage) === null || _q === void 0 ? void 0 : _q.cotextInfo.mentionedJid;
    const fromUser = ((_s = (_r = riko.key) === null || _r === void 0 ? void 0 : _r.partipant) === null || _s === void 0 ? void 0 : _s.split("@")[0]) || ((_u = (_t = riko.key) === null || _t === void 0 ? void 0 : _t.remoteJid) === null || _u === void 0 ? void 0 : _u.split("@")[0]);
    const userName = riko.pushName || fromUser;
    return {
        quotedMessage,
        imageMessage,
        textMessage,
        mentions,
        userName,
        from
    };
};
exports.extractMessage = extractMessage;
