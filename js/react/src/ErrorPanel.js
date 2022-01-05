import React from "react";
import Alert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    errorMessage: {
        margin: theme.spacing(2),
    },
}));

export default function ErrorPanel(props) {
    const classes = useStyles();

    if (props.message) {
        return (
            <Alert className={classes.errorMessage} severity="error">
                {props.message}
            </Alert>
        );
    } else {
        return "";
    }
}
