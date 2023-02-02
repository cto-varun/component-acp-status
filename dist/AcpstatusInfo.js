"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _shortid = _interopRequireDefault(require("shortid"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const AcpstatusInfo = _ref => {
  let {
    acpStatusSearchData = []
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_antd.Row, null, acpStatusSearchData && acpStatusSearchData.map(item => {
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, {
      key: _shortid.default.generate()
    }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 4,
      className: "acpStatusInfo-label mg-b--16"
    }, /*#__PURE__*/_react.default.createElement("span", null, item?.label)), /*#__PURE__*/_react.default.createElement(_antd.Col, {
      span: 8,
      className: "acpStatusInfo-name mg-b--16"
    }, /*#__PURE__*/_react.default.createElement("span", null, ":", ' ', item?.name !== '' && item?.name !== undefined ? item?.name : 'N/A')));
  })));
};
var _default = AcpstatusInfo;
exports.default = _default;
module.exports = exports.default;