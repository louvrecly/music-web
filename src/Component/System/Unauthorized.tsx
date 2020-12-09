import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";


class Unauthorized extends React.Component<{}, {}> {

    private returnToLastPage = (event: React.MouseEvent<any, MouseEvent>) => {
        console.log({event});
        // ...
    }

    public render() {
        return (
            <Modal>
                <ModalHeader>
                    <h1>Unauthorized</h1>
                </ModalHeader>
                <ModalBody>
                    <p>Sorry! You are not authorized to access this page! </p>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={this.returnToLastPage}>Return</Button>
                </ModalFooter>
            </Modal>
        );
    }
}

export default Unauthorized;