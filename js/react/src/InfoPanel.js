import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText  from '@material-ui/core/ListItemText';


const useStyles = makeStyles((theme) => ({
    infoPanel: {
        padding: theme.spacing(2),
    },
    list: {
        width: '100%'
    },
}));


function ListItemNonEmpty(props) {
    if (props.value) {
        return (
            <ListItem>
                <ListItemText primary={props.value} secondary={props.label} />
            </ListItem>
        )
    } else {
        return ""
    }
}


export default function InfoPanel(props) {
    const classes = useStyles();

    return (
        <Popover
            id={props.id}
            open={props.open}
            anchorEl={props.anchor}
            onClose={props.onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
        >
            <Paper className={classes.infoPanel}>
                <List className={classes.list} dense={true} >
                    <ListItemNonEmpty label="Name" value={props.info.name} />
                    <ListItemNonEmpty label="Description" value={props.info.description} />
                    <ListItemNonEmpty label="Recording date" value={props.info.rec_datetime} />
                    <ListItemNonEmpty label="Source" value={props.source} />
                    {
                        Object.entries(props.info.annotations || {}).map(([label, value]) => {
                            return <ListItemNonEmpty key={value} label={label} value={value} />
                        })
                    }
                </List>
            </Paper>
        </Popover>
    )

}