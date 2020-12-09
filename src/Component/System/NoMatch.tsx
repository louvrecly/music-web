import React from 'react';


class NoMatch extends React.Component<{}, {}> {
    public render() {
        return (
            <div>
                <h2>Error 404: NOT FOUND!</h2>
                <p>It seems like you are trying to access something non-existent!</p>
            </div>
        );
    }
}

export default NoMatch;