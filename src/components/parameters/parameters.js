import React, { useRef, useState, useContext } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Modal } from 'react-bootstrap';
import { useRecoilValue } from 'recoil';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { CopyIcon } from '@primer/octicons-react';
import { parameterToJson } from '../../utils';
import atoms from '../atoms';

import { atomDark as prismStyle } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './parameters.css';

const ParameterContext = React.createContext();

async function executeRequest(baseUrl, verb, path, values) {

    const request = {
        method: verb,
        headers: { 'accept': 'application/json' }
    };

    for (var p of values.filter(x => x.data.in === 'path')) {
        path = path.replace(`{${p.data.name}}`, p.getValue());
    }

    let url = `${baseUrl}${path}`;

    const formData = values.filter(x => x.data.in === 'formData');

    if (formData.length > 0) {
        const data = new FormData();
        for (let p of formData) {
            data.append(p.data.name, p.getValue());
        }
        request.body = data;
    }

    const body = values.filter(x => x.data.in === 'body')[0];
    if (body) {
        request.body = JSON.stringify(body.getValue());
    }

    const queryParams = values.filter(x => x.data.in === 'query');
    if (queryParams.length > 0) {
        const query = queryParams.reduce((a, x) => ({ ...a, ...{ [x.data.name]: x.getValue() } }), {});
        url += '?' + new URLSearchParams(query);
    }

    const response = await fetch(url, request);
    const json = await response.json();

    return json;
}

function Parameters({ verb, path, parameters }) {
    const values = [];
    const register = (data, getValue) => values.push({ data, getValue });

    const protocol = useRecoilValue(atoms.protocolState);

    return (
        <Container fluid>
            <Row>
                <Col>
                    <p className="text-muted">Parameters:</p>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form validated>
                        {parameters.map((data, i) =>
                            <ParameterContext.Provider key={i} value={{ register, data }}>
                                <ParameterContainer />
                            </ParameterContext.Provider>
                        )}
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col>
                    <ExecuteRequest {...{ protocol, verb, path, values }} />
                </Col>
            </Row>
        </Container >
    );
}

export default Parameters;

function ExecuteRequest({ protocol, verb, path, values }) {
    const schema = useRecoilValue(atoms.schemaState);
    const [response, setResponse] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);
    const baseUrl = `${protocol}://${schema.host}${schema.basePath}`;

    return (
        <>
            <Button
                onClick={
                    async () => {
                        setIsExecuting(true);
                        try {
                            const json = await executeRequest(baseUrl, verb, path, values);
                            setResponse(JSON.stringify(json, null, 2));
                        } catch (err) {
                        } finally {
                            setIsExecuting(false);
                        }
                    }}>
                {isExecuting
                    ? <Spinner animation="border" size="sm" />
                    : 'Try it out'}
            </Button>
            {response &&
                <>
                    <span className="d-block pt-3 text-muted">
                        Response:
                    </span>
                    <CopyModal text={response} />
                    <ResponseMarkdown text={'```json\n' + response + '\n```'} />
                </>
            }
        </>);
}

function CopyModal({ text }) {
    const ref = useRef();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleCopy = (e) => {
        ref.current.select();
        document.execCommand('copy');
        e.target.focus();
        setShow(false);
    };

    const rows = Math.min(text.match(/$/mg).length, 10);

    return (
        <>
            {document.queryCommandSupported('copy') &&
                <Button className="copy-button" variant="outline-secondary" size="sm" onClick={handleShow}>
                    <CopyIcon size="small" />
                </Button>}
            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Copy...</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <textarea ref={ref} className="w-100" defaultValue={text} rows={rows} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCopy}>Copy</Button>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

function ResponseMarkdown({ text }) {
    return (
        <div className="force-height">
            <ReactMarkdown
                length={10}
                source={text}
                renderers={
                    {
                        code: ({ value, language }) =>
                            <SyntaxHighlighter language={language} style={prismStyle}>
                                {value}
                            </SyntaxHighlighter>
                    }
                }>
            </ReactMarkdown>
        </div>
    );
}

function ParameterBody() {
    const ref = useRef();
    const { register, data, data: { name, schema, required } } = useContext(ParameterContext);
    register(data, () => ref.current.value);
    const json = parameterToJson(name, schema);
    const text = JSON.stringify(json, null, 2);
    const rows = text.match(/$/mg).length;

    return (
        <Form.Group>
            <Form.Label>{data.description}</Form.Label>
            <Form.Control ref={ref} as="textarea" rows={rows} defaultValue={text} required={required} />
        </Form.Group>);
}

function Parameter() {
    const ref = useRef();
    const { register, data, data: { description, required } } = useContext(ParameterContext);
    register(data, () => ref.current.value);
    return (
        <Form.Group>
            <Form.Label>{description}</Form.Label>
            <Form.Control ref={ref} placeholder="value" required={required} />
        </Form.Group>
    );
}

function renderParameter(data) {
    switch (data.type || data.schema.type) {
        case 'object': return <ParameterBody />;
        case 'file': return <ParameterFile />;
        default: return data.items && data.items.enum ? <ParameterEnum /> : <Parameter />;
    }
}

function ParameterContainer() {
    const { data } = useContext(ParameterContext);
    return (
        <Form.Row>
            <Col>
                <ParameterInfo />
            </Col>
            <Col>
                {renderParameter(data)}
            </Col>
        </Form.Row>);
}

function ParameterEnum() {
    const ref = useRef();
    const { register, data, data: { collectionFormat, description, required } } = useContext(ParameterContext);
    register(data, () => Array.from(ref.current.selectedOptions, x => x.value));
    return (
        <Form.Group>
            <Form.Label>{description}</Form.Label>
            <Form.Control ref={ref} as="select" required={required} multiple={collectionFormat === 'multi'}>
                {data.items.enum.map((x, i) => <option key={i}>{x}</option>)}
            </Form.Control>
        </Form.Group>
    );
}

function ParameterFile() {
    const ref = useRef();
    const { register, data, data: { description, required } } = useContext(ParameterContext);
    register(data, () => ref.current.files[0]);
    return (
        <Form.Group>
            <Form.Label>{description}</Form.Label>
            <Form.File ref={ref} placeholder="file" required={required} />
        </Form.Group>
    );
}

function ParameterInfo() {
    const { data, data: { name, type, format, required } } = useContext(ParameterContext);
    return (
        <Form.Group>
            <div className="parameter">
                <div>
                    <b>{name}</b>
                    {required &&
                        <sup>
                            <code>* required</code>
                        </sup>}
                </div>
                <div>
                    {format ? `${type} (${format})` : type}
                </div>
                <div>
                    <i className="text-muted">({data.in})</i>
                </div>
            </div>
        </Form.Group>
    );
}