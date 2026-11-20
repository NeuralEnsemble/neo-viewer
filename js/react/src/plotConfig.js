// Plotly config shared by the signal and spike train plots.
//
// Plotly.js 2 removed the spike-line and hover-mode buttons from the default
// mode bar; add them back, since they are useful for reading values off
// electrophysiology traces (see homepage/guide_plotly_interactivity.html).
export const PLOT_CONFIG = {
    // These are the names Plotly accepts here, not the internal button
    // names ("hoverClosestCartesian" etc., which are silently ignored).
    modeBarButtonsToAdd: ["togglespikelines", "hoverclosest", "hovercompare"],
};
