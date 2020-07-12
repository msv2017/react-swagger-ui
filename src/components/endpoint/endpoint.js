import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Badge, Container, Row, Col, Alert } from 'react-bootstrap';
import EndpointParameters from '../parameters/parameters';
import ExpandableCard from '../expandable-card/expandable-card';
import "./endpoint.css";

const verbVariants = {
    get: "secondary",
    post: "success",
    put: "warning",
    delete: "danger"
};

function EndpointHeader({ verb, path, summary, deprecated }) {
    return (
        <Container fluid>
            <Row>
                <Badge className="my-auto" variant={verbVariants[verb]}>
                    {verb.toUpperCase()}
                </Badge>
                <Col>
                    <ReactMarkdown className="endpoint-path">
                        {path.replace('{', '`{').replace('}', '}`')}
                    </ReactMarkdown>
                </Col>
                {deprecated &&
                    <Col>
                        <code><b>deprecated</b></code>
                    </Col>}
                <Col md="auto">
                    {summary}
                </Col>
            </Row>
        </Container>
    );
}

function Endpoint({ verb, path, data: { summary, deprecated, parameters } }) {
    return (
        <Alert
            className="p-0 endpoint"
            variant={verbVariants[verb]}
        >
            <ExpandableCard
                header={<EndpointHeader {...{ verb, path, summary, deprecated }} />}
                body={<EndpointParameters {...{ verb, path, parameters }} />}
            />
        </Alert>
    );
}

export default Endpoint;