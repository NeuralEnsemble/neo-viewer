import React from "react";
import Alert from "@mui/material/Alert";

export default function ErrorPanel(props) {
    if (props.message) {
        return (
            <Alert sx={{ margin: 2 }} severity="error">
                {props.message}
            </Alert>
        );
    } else {
        return "";
    }
}
