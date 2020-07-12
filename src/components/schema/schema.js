import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useRecoilState } from 'recoil';
import { Badge, Container, Row, Col, ButtonGroup, DropdownButton, Dropdown, Form } from 'react-bootstrap';
import ExpandableCard from '../expandable-card/expandable-card';
import Endpoint from '../endpoint/endpoint';
import { getSections } from '../../utils';
import atoms from '../atoms';

import './schema.css';

function Schema(
    {
        schema,
        schema: {
            info: {
                title,
                version,
                description
            }
        }
    }) {

    const [protocol, setProtocol] = useRecoilState(atoms.protocolState);

    const sections = getSections(schema);

    return (
        schema &&
        <>
            <Container>
                <Row>
                    <Col>
                        <h1>
                            {title}
                            <sup><Badge pill variant="light">{version}</Badge></sup>
                        </h1>
                        <ReactMarkdown>
                            {description}
                        </ReactMarkdown>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form>
                            <Form.Group>
                                <DropdownButton
                                    as={ButtonGroup}
                                    variant="outline-primary"
                                    title={`Schema: ${protocol.toUpperCase()}`}>
                                    <Dropdown.Item eventKey="1" onSelect={() => setProtocol('http')}>HTTP</Dropdown.Item>
                                    <Dropdown.Item eventKey="2" onSelect={() => setProtocol('https')}>HTTPS</Dropdown.Item>
                                </DropdownButton>
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {sections.map(({ info, endpoints }, i) =>
                            <ExpandableCard
                                key={i}
                                header={<SectionInfo {...info} />}
                                body={endpoints.map((endpoint, j) => <Endpoint key={j} {...endpoint} />)}
                            />
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

function SectionInfo({ name, description }) {
    return (<Container>
        <Row>
            <Col md="auto"><h5 className="m-0">{name}</h5></Col>
            <Col className="text-muted">{description}</Col>
        </Row>
    </Container>);
}

export default Schema;