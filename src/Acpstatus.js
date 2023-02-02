import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Typography, Input, Col, Row, Alert } from 'antd';
import moment from 'moment';
import { MessageBus } from '@ivoyant/component-message-bus';
import AcpstatusInfo from './AcpstatusInfo';
import './styles.css';
const Acpstatus = ({ visible, setShowAcpstatus, datasources, properties }) => {
    const { Text } = Typography;
    const [form] = Form.useForm();

    const [isModalOpen, setIsModalOpen] = useState(visible);
    const [acpStatusSearchData, setAcpStatusSearchData] = useState(undefined);
    const [errMessage, setErrMessage] = useState(undefined);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const searchAcpAppStatusWorkflow = properties?.searchAcpAppStatusWorkflow;

    const {
        workflow: searchAcpStatusWorkflow,
        datasource: searchAcpStatusDatasource,
        errorStates: searchAcpStatusErrorStates,
        successStates: searchAcpStatusSuccessStates,
        responseMapping: searchAcpStatusResponseMapping,
    } = searchAcpAppStatusWorkflow;

    const componentConstants = {
        modalWidth: 778,
        maxSearchInputLength: 12,
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
        rejections: [
            {
                fedStateRejectReason: '',
            },
        ],
    };

    //Structure the search response data
    const setResponseData = (responseData = defaultStatusResponse) => {

        const {
            firstName,
            lastName,
            contactPhoneNumber,
            applicationId,
            eligibilityCheckStatus,
            failures = [],
        } = responseData || {};

        let {
            eligibilityExpirationDate,
            status,
            rejections = [],
            // failures = [],
        } = eligibilityCheckStatus || {};

        eligibilityExpirationDate = eligibilityExpirationDate === '' ? responseData?.eligibilityExpirationDate : eligibilityExpirationDate;

        setAcpStatusSearchData([
            { name: firstName + ` ${lastName}`, label: 'Name' },
            { name: status, label: 'Status' },
            { name: contactPhoneNumber, label: 'CTN' },
            // { name: failures ? failures[0] : '', label: 'Failure' },
            { name: failures ? failures[0] : '', label: 'Failure' },
            { name: applicationId, label: 'Application ID' },
            {
                name: rejections ? rejections[0]?.fedStateRejectReason : '',
                label: 'Rejections',
            },
            {
                name: moment(eligibilityExpirationDate).format('YYYY MMMM DD'),
                label: 'Expiration',
            },
        ]);
    };

    // To handle the search response
    const handleImeiSearchResponse = (
        subscriptionId,
        topic,
        eventData,
        closure
    ) => {
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
                    setErrMessage(
                        eventData?.event?.data?.response?.data?.causedBy[0]
                            ?.message
                    );
                } else {
                    setErrMessage(
                        eventData?.event?.data?.response?.data?.message
                    );
                }
            }
            setLoadingSearch(false);
            MessageBus.unsubscribe(subscriptionId);
        }
    };

    // To handle the search
    const onFinish = (values) => {
        if (values !== undefined && values !== '') {
            setLoadingSearch(true);
            const submitEvent = 'SUBMIT';
            MessageBus.send(
                'WF.'.concat(searchAcpStatusWorkflow).concat('.INIT'),
                {
                    header: {
                        registrationId: searchAcpStatusWorkflow,
                        workflow: searchAcpStatusWorkflow,
                        eventType: 'INIT',
                    },
                }
            );
            MessageBus.subscribe(
                searchAcpStatusWorkflow,
                'WF.'.concat(searchAcpStatusWorkflow).concat('.STATE.CHANGE'),
                handleImeiSearchResponse
            );
            MessageBus.send(
                'WF.'
                    .concat(searchAcpStatusWorkflow)
                    .concat('.')
                    .concat(submitEvent),
                {
                    header: {
                        registrationId: searchAcpStatusWorkflow,
                        workflow: searchAcpStatusWorkflow,
                        eventType: submitEvent,
                    },
                    body: {
                        datasource: datasources[searchAcpStatusDatasource],
                        request: {
                            params: { acpAppId: values.acpAppId },
                        },
                        searchAcpStatusResponseMapping,
                    },
                }
            );
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    // When we copy and paste some vaules in the search input
    const handlePasteChange = (e) => {
        let inputAppId = e.target.value;

        // eleminate blank spaces from the copied value
        inputAppId = e.clipboardData
            .getData('Text')
            .replace(/\s+/g, '')
            .slice(0, componentConstants.maxSearchInputLength);
        form.setFieldsValue({
            acpAppId: inputAppId,
        });
    };

    useEffect(() => {
        MessageBus.subscribe(
            'SHOW_ACP_STATUS',
            'SHOW_ACP_STATUS',
            handleAcpstatusVisibility
        );
        return () => {
            MessageBus.unsubscribe('SHOW_ACP_STATUS');
        };
    }, []);

    return (
        <>
            <Modal
                title="ACP Application Status"
                open={visible}
                onOk={() => handleOk()}
                onCancel={() => handleCancel()}
                footer={null}
                width={componentConstants.modalWidth}
            >
                <p>Enter Application ID to get your application status</p>
                <div className="mg-b--16">
                    <Form
                        form={form}
                        name="basic"
                        layout="inline"
                        initialValues={{
                            remember: false,
                            initialValue: '',
                        }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Row style={{ width: '100%' }}>
                            <Col span={20}>
                                <Form.Item
                                    name="acpAppId"
                                    // normalize={(value) => value.replace(/[^0-9]/gi, '')}
                                    rules={[
                                        {
                                            required: true,
                                            validateTrigger: 'onBlur',
                                            message:
                                                'Please enter a valid Application ID',
                                        },
                                    ]}
                                >
                                    <Input
                                        allowClear
                                        type="text"
                                        placeholder="Enter Application ID. e.g. AB1234-123CD"
                                        maxLength={
                                            componentConstants.maxSearchInputLength
                                        }
                                        onPaste={(e) => {
                                            handlePasteChange(e);
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loadingSearch}
                                    >
                                        SEARCH
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </div>
                {errMessage ? (
                    <Alert message={errMessage} type="error" />
                ) : (
                    acpStatusSearchData && (
                        <AcpstatusInfo
                            acpStatusSearchData={acpStatusSearchData}
                        />
                    )
                )}
            </Modal>
        </>
    );
};
export default Acpstatus;
