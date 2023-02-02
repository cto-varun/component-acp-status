import React, { useState, useEffect } from 'react';
import { Col, Row } from 'antd';
import shortid from 'shortid';

const AcpstatusInfo = ({ acpStatusSearchData = [] }) => {
    return (
        <div>
            <Row>
                {acpStatusSearchData &&
                    acpStatusSearchData.map((item) => {
                        return (
                            <React.Fragment key={shortid.generate()}>
                                <Col
                                    span={4}
                                    className="acpStatusInfo-label mg-b--16"
                                >
                                    <span>{item?.label}</span>
                                </Col>
                                <Col
                                    span={8}
                                    className="acpStatusInfo-name mg-b--16"
                                >
                                    <span>
                                        :{' '}
                                        {item?.name !== '' &&
                                        item?.name !== undefined
                                            ? item?.name
                                            : 'N/A'}
                                    </span>
                                </Col>
                            </React.Fragment>
                        );
                    })}
            </Row>
        </div>
    );
};

export default AcpstatusInfo;
