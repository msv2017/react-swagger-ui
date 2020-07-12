import React, { useState } from 'react';
import { Container, Row, Col, Accordion, Card } from 'react-bootstrap';
import { ChevronRightIcon, ChevronDownIcon } from '@primer/octicons-react';

function ExpandableCard({ header, body }) {
    const [isOpened, setIsOpened] = useState(false);

    return (
        <Accordion>
            <Accordion.Toggle
                eventKey="0"
                as={Card.Header}
                onClick={() => setIsOpened(!isOpened)}
            >
                <Container fluid>
                    <Row>
                        <Col className="p-0 my-auto">{header}</Col>
                        {/* <Col md="auto" className="my-auto"> */}
                            {isOpened
                                ? <ChevronDownIcon size="medium" />
                                : <ChevronRightIcon size="medium" />}
                        {/* </Col> */}
                    </Row>
                </Container>
            </Accordion.Toggle>
            <Accordion.Collapse eventKey="0">
                <Card.Body>
                    {body}
                </Card.Body>
            </Accordion.Collapse>
        </Accordion>
    );
}

export default ExpandableCard;