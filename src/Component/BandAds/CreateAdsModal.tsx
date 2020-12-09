import * as React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import { IRootState, ThunkDispatch } from '../../store';
import { FaExclamationCircle } from 'react-icons/fa';
import { remoteCreateBandAds } from '../../redux/Band/action';
import "./BandAds.css";


interface ICreatAdsModalProps {
    modal: boolean,
    adsToggle: () => void,
    createAds: (headline:string, description:string, message:string, instruments:string[]) =>void
    msgInfo: string | null
}

interface ICreatAdsModalState {
    headlineInput: string,
    descriptionInput: string,
    messageInput: string,
    keyboard: boolean,
    guitar: boolean,
    bass: boolean,
    drums: boolean,
    checkInput:boolean
}


class CreatAdsModal extends React.Component<ICreatAdsModalProps, ICreatAdsModalState>{


    state: ICreatAdsModalState = {
        headlineInput: "",
        descriptionInput: "",
        messageInput: "",
        keyboard: false,
        guitar: false,
        bass: false,
        drums: false,
        checkInput:true
    }

    private onCreateAdsInput = (field: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const input: any = Object.assign({}, { [field]: event.currentTarget.value })
        this.setState(input);
    }

    private onInstrumentsInput = (instrument:string, event:React.ChangeEvent<HTMLInputElement>) => {
        const input: any = Object.assign({}, { [instrument]: event.target.checked })
        this.setState(input);
    }

    private onCreateAds = () => {
        let instruments = []
        if (this.state.keyboard){
            instruments.push('keyboard')
        }
        if (this.state.guitar){
            instruments.push('guitar')
        }
        if (this.state.bass){
            instruments.push('bass')
        }
        if (this.state.drums){
            instruments.push('drums')
        }
        if (this.state.messageInput && this.state.headlineInput && this.state.descriptionInput){
            this.setState({
                checkInput:true
            })
        this.props.createAds(this.state.headlineInput, this.state.descriptionInput, this.state.messageInput, instruments)
        }
        else {
            this.setState({
                checkInput:false
            })
        }
    }
    
    private adsToggle = () =>{
        this.props.adsToggle()
        this.setState({
            checkInput:true
        })
    }

    public render() {
        return (
            <Modal isOpen={this.props.modal} centered={true} toggle={this.adsToggle}>
                <ModalHeader>Place a wanted ad</ModalHeader>
                <ModalBody>
                    <div className="form-group">
                        <div className="row">
                            <div className="col">
                                <label htmlFor="adName">Ad Headline</label><br />
                                <Input type="text" id="adName" value={this.state.headlineInput} onChange={this.onCreateAdsInput.bind(this, "headlineInput")} placeholder="Give your ad a title" />
                            </div>
                            <div className="col">
                                <label htmlFor="adDesc">Description</label><br />
                                <Input type="text" id="adDesc" value={this.state.descriptionInput} onChange={this.onCreateAdsInput.bind(this, "descriptionInput")} placeholder="Describe your band" />
                            </div>
                        </div>
                        <br />
                        <div className="row">
                            <div className="col">
                                <label htmlFor="adMsg">Message</label>
                                <Input type="text" id="adMsg" value={this.state.messageInput} onChange={this.onCreateAdsInput.bind(this, "messageInput")} placeholder="Message to musicians" />
                            </div>
                        </div>
                        <br/>
                        <div className="row">
                            <div className="col">
                                <label htmlFor="instrument">instrument required</label>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-3 toLeft">
                                <Input type="checkbox" id="instrument1" defaultValue="keyboard" checked={this.state.keyboard} onChange={this.onInstrumentsInput.bind(this, "keyboard")}/>
                                <label className="form-check-label" htmlFor="instrument1">Keyboard</label>
                            </div>
                            <div className="col-3 toLeft">
                                <Input type="checkbox" id="instrument2" defaultValue="guitar" checked={this.state.guitar} onChange={this.onInstrumentsInput.bind(this, "guitar")}/>
                                <label className="form-check-label" htmlFor="instrument2">Guitar</label>
                            </div>
                            <div className="col-3 toLeft">
                                <Input type="checkbox" id="instrument3" defaultValue="bass" checked={this.state.bass} onChange={this.onInstrumentsInput.bind(this, "bass")}/>
                                <label className="form-check-label" htmlFor="instrument3">Bass</label>
                            </div>
                            <div className="col-3 toLeft">
                                <Input type="checkbox" id="instrument4" defaultValue="drums"checked={this.state.drums} onChange={this.onInstrumentsInput.bind(this, "drums")} />
                                <label className="form-check-label" htmlFor="instrument4">Drums</label>
                            </div>
                        </div>
                    </div>

                </ModalBody>
                <ModalFooter>
                {this.props.msgInfo &&  <Alert color="danger"><FaExclamationCircle />{this.props.msgInfo}</Alert>}
                {!this.state.checkInput && <Alert color="danger"><FaExclamationCircle />Please fill in the blank</Alert>}
                    <Button color="danger" onClick={this.adsToggle}>Close</Button>
                    <Button color="primary" onClick={this.onCreateAds}>Submit</Button>
                </ModalFooter>
            </Modal>
        )
    }
}

export default connect((state:IRootState) => {
    return {
        msgInfo:state.band.msgInfo
    }
}
    , (dispatch: ThunkDispatch) => {
    return {
        createAds: (headline:string, description:string, message:string, instruments:string[]) => dispatch(remoteCreateBandAds(headline, description, message, instruments))
    }
})(CreatAdsModal);