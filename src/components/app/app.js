import React, { useEffect, useState, useRef } from 'react';
import { InputGroup, FormControl, Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import { useRecoilState } from 'recoil';
import Schema from '../schema/schema';
import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { replaceLocalRefs } from '../../utils';
import atoms from '../atoms';

const defaultUrl = 'https://petstore.swagger.io/v2/swagger.json';

function App() {

  const [schema, setSchema] = useRecoilState(atoms.schemaState);
  const [schemaUrl, setSchemaUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const schemaUrlRef = useRef()

  useEffect(() => {
    async function getJsonSchema() {
      const response = await fetch(defaultUrl);
      const json = await response.json();

      replaceLocalRefs(json);

      // console.log(JSON.stringify(json));

      setSchema(json);
      setIsLoading(false);
    }

    if (schemaUrl) {
      setIsLoading(true);
      getJsonSchema();
    }
  }, [schemaUrl, setSchema, setIsLoading]);

  return (
    <>
      <Container>
        <Row>
          <Col>
            <InputGroup className="mb-3">
              <FormControl
                ref={schemaUrlRef}
                placeholder="Swagger schema URL..."
                aria-label="Swagger schema URL"
                aria-describedby="basic-addon2"
                defaultValue="https://petstore.swagger.io/v2/swagger.json"
              />
              <InputGroup.Append>

                <Button
                  variant="outline-secondary"
                  disabled={isLoading}
                  onClick={() => setSchemaUrl(schemaUrlRef.current.value)}
                >
                  {isLoading ? <Spinner animation="border" size="sm" /> : 'Explore'}
                </Button>
              </InputGroup.Append>
            </InputGroup>
          </Col>
        </Row>

        {
          schema &&
          <Row>
            <Col>
              <Schema schema={schema} />
            </Col>
          </Row>
        }
      </Container>
    </>
  );
}

export default App;
