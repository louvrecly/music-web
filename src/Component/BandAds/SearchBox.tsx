import * as React from 'react'
import { connect } from 'react-redux';
import { ThunkDispatch } from '../../store';
import { remoteSearchAds, remoteLoadBandAds } from '../../redux/Band/action';
import "./BandAds.css";

interface Props {
    searchAds:(bandName:string, headline:string, instruments:string) => void;
    resetAds:() => void;
}

interface State {
    bandNameInput:string,
    adHeadlineInput:string,
    instrumentInput:string
}

class SearchBox extends React.Component<Props,State> {
    
    state:State ={
        bandNameInput:"",
        adHeadlineInput:"",
        instrumentInput:""
    }

    private onSearchChange =(field:string, event: React.ChangeEvent<HTMLInputElement>) =>{
        const input:any = Object.assign({},{[field]:event.currentTarget.value})
        this.setState(input);
    }

    private onSearch = () => {
        this.props.searchAds(this.state.bandNameInput.trim(), this.state.adHeadlineInput.trim(), this.state.instrumentInput.trim())
    }

    private onResetAds = () => {
        this.props.resetAds()
    }

    render() {
        return (
            <div className="col-lg-7 col-md-7 col-sm-6 col-xs-7 bandSearch">
                <h3>Search</h3>
                    <div className="row" id="searchHead">
                        <div className="col-4 searchTitle">Band Name<input type="checkbox" className="searchBox" id="searchBox1" /><input type="text" className="searchInput" id="bandNameSearch" value={this.state.bandNameInput} onChange={this.onSearchChange.bind(this, "bandNameInput")} placeholder="Band name" /></div>
                        <div className="col-4 searchTitle">Ad Headline<input type="checkbox" className="searchBox" id="searchBox2" /><input type="text" className="searchInput" id="headlineSearch" value={this.state.adHeadlineInput} onChange={this.onSearchChange.bind(this, "adHeadlineInput")} placeholder="Headline" /></div>
                        <div className="col-4 searchTitle">Instrument<input type="checkbox" className="searchBox" id="searchBox3" /><input type="text" className="searchInput" id="instrumentSearch" value={this.state.instrumentInput} onChange={this.onSearchChange.bind(this, "instrumentInput")} placeholder="Instrument" /></div>
                    </div>
                    <div id="searchRow">
                        <button type="submit" className="btn btn-primary" onClick={this.onSearch.bind(this)}>Search</button>
                        <button type="submit" className="btn btn-danger resetButton" onClick={this.onResetAds.bind(this)}>Reset</button>
                    </div>
                </div>

        )
    }
}

export default connect(() => ({}), (dispatch: ThunkDispatch) => {
    return {
        searchAds: (bandName:string, headline:string, instruments:string) => dispatch(remoteSearchAds(bandName, headline, instruments)),
        resetAds: () => dispatch(remoteLoadBandAds())
    }
})(SearchBox);