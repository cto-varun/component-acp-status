"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _antd = require("antd");
var _moment = _interopRequireDefault(require("moment"));
var _componentMessageBus = require("@ivoyant/component-message-bus");
var _AcpstatusInfo = _interopRequireDefault(require("./AcpstatusInfo"));
require("./styles.css");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const Acpstatus = _ref => {
  let {
    visible,
    setShowAcpstatus,
    datasources,
    properties
  } = _ref;
  const {
    Text
  } = _antd.Typography;
  const [form] = _antd.Form.useForm();
  const [isModalOpen, setIsModalOpen] = (0, _react.useState)(visible);
  const [acpStatusSearchData, setAcpStatusSearchData] = (0, _react.useState)(undefined);
  const [errMessage, setErrMessage] = (0, _react.useState)(undefined);
  const [loadingSearch, setLoadingSearch] = (0, _react.useState)(false);
  const searchAcpAppStatusWorkflow = properties?.searchAcpAppStatusWorkflow;
  const {
    workflow: searchAcpStatusWorkflow,
    datasource: searchAcpStatusDatasource,
    errorStates: searchAcpStatusErrorStates,
    successStates: searchAcpStatusSuccessStates,
    responseMapping: searchAcpStatusResponseMapping
  } = searchAcpAppStatusWorkflow;
  const componentConstants = {
    modalWidth: 778,
    maxSearchInputLength: 12
  };

  //Reset the response data and input fields
  const resetAll = () => {
    setErrMessage(false);
    form.resetFields();
    setAcpStatusSearchData(false);
    setLoadingSearch(false);
  };
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setShowAcpstatus(false);
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setShowAcpstatus(false);
    setIsModalOpen(false);
    resetAll();
  };
  const handleAcpstatusVisibility = () => {
    setShowAcpstatus(true);
    resetAll();
  };
  const defaultStatusResponse = {
    firstName: '',
    lastName: '',
    contactPhoneNumber: '',
    failures: [],
    applicationId: '',
    rejections: [{
      fedStateRejectReason: ''
    }]
  };

  //Structure the search response data
  const setResponseData = function () {
    let responseData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultStatusResponse;
    const {
      firstName,
      lastName,
      contactPhoneNumber,
      applicationId,
      eligibilityCheckStatus,
      failures = []
    } = responseData || {};
    let {
      eligibilityExpirationDate,
      status,
      rejections = []
      // failures = [],
    } = eligibilityCheckStatus || {};
    eligibilityExpirationDate = eligibilityExpirationDate === '' ? responseData?.eligibilityExpirationDate : eligibilityExpirationDate;
    setAcpStatusSearchData([{
      name: firstName + ` ${lastName}`,
      label: 'Name'
    }, {
      name: status,
      label: 'Status'
    }, {
      name: contactPhoneNumber,
      label: 'CTN'
    },
    // { name: failures ? failures[0] : '', label: 'Failure' },
    {
      name: failures ? failures[0] : '',
      label: 'Failure'
    }, {
      name: applicationId,
      label: 'Application ID'
    }, {
      name: rejections ? rejections[0]?.fedStateRejectReason : '',
      label: 'Rejections'
    }, {
      name: (0, _moment.default)(eligibilityExpirationDate).format('YYYY MMMM DD'),
      label: 'Expiration'
    }]);
  };

  // To handle the search response
  const handleImeiSearchResponse = (subscriptionId, topic, eventData, closure) => {
    const state = eventData.value;
    const isSuccess = searchAcpStatusSuccessStates.includes(state);
    const isFailure = searchAcpStatusErrorStates.includes(state);
    if (isSuccess || isFailure) {
      if (isSuccess) {
        setResponseData(eventData?.event?.data?.data);
        // setAcpStatusSearchData(eventData?.event?.data?.data);
        setErrMessage(null);
      }
      if (isFailure) {
        if (eventData?.event?.data?.response?.data?.causedBy) {
          setErrMessage(eventData?.event?.data?.response?.data?.causedBy[0]?.message);
        } else {
          setErrMessage(eventData?.event?.data?.response?.data?.message);
        }
      }
      setLoadingSearch(false);
      _componentMessageBus.MessageBus.unsubscribe(subscriptionId);
    }
  };

  // To handle the search
  const onFinish = values => {
    if (values !== undefined && values !== '') {
      setLoadingSearch(true);
      const submitEvent = 'SUBMIT';
      _componentMessageBus.MessageBus.send('WF.'.concat(searchAcpStatusWorkflow).concat('.INIT'), {
        header: {
          registrationId: searchAcpStatusWorkflow,
          workflow: searchAcpStatusWorkflow,
          eventType: 'INIT'
        }
      });
      _componentMessageBus.MessageBus.subscribe(searchAcpStatusWorkflow, 'WF.'.concat(searchAcpStatusWorkflow).concat('.STATE.CHANGE'), handleImeiSearchResponse);
      _componentMessageBus.MessageBus.send('WF.'.concat(searchAcpStatusWorkflow).concat('.').concat(submitEvent), {
        header: {
          registrationId: searchAcpStatusWorkflow,
          workflow: searchAcpStatusWorkflow,
          eventType: submitEvent
        },
        body: {
          datasource: datasources[searchAcpStatusDatasource],
          request: {
            params: {
              acpAppId: values.acpAppId
            }
          },
          searchAcpStatusResponseMapping
        }
      });
    }
  };
  const onFinishFailed = errorInfo => {
    console.log('Failed:', errorInfo);
  };

  // When we copy and paste some vaules in the search input
  const handlePasteChange = e => {
    let inputAppId = e.target.value;

    // eleminate blank spaces from the copied value
    inputAppId = e.clipboardData.getData('Text').replace(/\s+/g, '').slice(0, componentConstants.maxSearchInputLength);
    form.setFieldsValue({
      acpAppId: inputAppId
    });
  };
  (0, _react.useEffect)(() => {
    _componentMessageBus.MessageBus.subscribe('SHOW_ACP_STATUS', 'SHOW_ACP_STATUS', handleAcpstatusVisibility);
    return () => {
      _componentMessageBus.MessageBus.unsubscribe('SHOW_ACP_STATUS');
    };
  }, []);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_antd.Modal, {
    title: "ACP Application Status",
    open: visible,
    onOk: () => handleOk(),
    onCancel: () => handleCancel(),
    footer: null,
    width: componentConstants.modalWidth
  }, /*#__PURE__*/_react.default.createElement("p", null, "Enter Application ID to get your application status"), /*#__PURE__*/_react.default.createElement("div", {
    className: "mg-b--16"
  }, /*#__PURE__*/_react.default.createElement(_antd.Form, {
    form: form,
    name: "basic",
    layout: "inline",
    initialValues: {
      remember: false,
      initialValue: ''
    },
    onFinish: onFinish,
    onFinishFailed: onFinishFailed,
    autoComplete: "off"
  }, /*#__PURE__*/_react.default.createElement(_antd.Row, {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 20
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, {
    name: "acpAppId"
    // normalize={(value) => value.replace(/[^0-9]/gi, '')}
    ,
    rules: [{
      required: true,
      validateTrigger: 'onBlur',
      message: 'Please enter a valid Application ID'
    }]
  }, /*#__PURE__*/_react.default.createElement(_antd.Input, {
    allowClear: true,
    type: "text",
    placeholder: "Enter Application ID. e.g. AB1234-123CD",
    maxLength: componentConstants.maxSearchInputLength,
    onPaste: e => {
      handlePasteChange(e);
    }
  }))), /*#__PURE__*/_react.default.createElement(_antd.Col, {
    span: 4
  }, /*#__PURE__*/_react.default.createElement(_antd.Form.Item, null, /*#__PURE__*/_react.default.createElement(_antd.Button, {
    type: "primary",
    htmlType: "submit",
    loading: loadingSearch
  }, "SEARCH")))))), errMessage ? /*#__PURE__*/_react.default.createElement(_antd.Alert, {
    message: errMessage,
    type: "error"
  }) : acpStatusSearchData && /*#__PURE__*/_react.default.createElement(_AcpstatusInfo.default, {
    acpStatusSearchData: acpStatusSearchData
  })));
};
var _default = Acpstatus;
exports.default = _default;
module.exports = exports.default;