import * as React from 'react';
import { createStyles, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

const styles = createStyles({
    root: {
        flexGrow: 1
    },
}); 

class Header extends React.Component {
    public render() {
        return (
            <div className='root'>
                <AppBar position="static">
                    <Toolbar/>
                </AppBar>
            </div>
        );
    }
}

export default withStyles(styles)(Header);