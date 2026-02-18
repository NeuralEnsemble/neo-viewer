import React from 'react';

import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';


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
            <Paper sx={{ padding: 2 }}>
                <List sx={{ width: '100%' }} dense={true} >
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
