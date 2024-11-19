from dash import Dash, dcc, html, Input, Output
import plotly.express as px
import numpy as np
import pandas as pd

wine_data = pd.read_csv("./data/combined_wine_quality.csv")

app = Dash(__name__)

app.layout = html.Div(
    [
        html.H1("Chemical Properties vs Quality", style={"textAlign": "center"}),
        html.Div(
            [
                html.Label("Select a Chemical Property:"),
                dcc.Dropdown(
                    id="chemical-property",
                    options=[
                        {"label": col, "value": col}
                        for col in wine_data.columns
                        if col not in ["quality", "type"]
                    ],
                    value="citric acid",
                    clearable=False,
                ),
            ],
            style={"width": "50%", "margin": "auto"},
        ),
        dcc.Graph(id="property-quality-plot", style={"height": "70vh"}),
    ]
)


@app.callback(
    Output("property-quality-plot", "figure"), [Input("chemical-property", "value")]
)
def update_plot(property_name):
    wine_data["property_bins"] = pd.cut(wine_data[property_name], bins=5, labels=False)

    grouped_data = (
        wine_data.groupby(["property_bins", "quality"]).size().reset_index(name="count")
    )

    bin_edges = np.linspace(
        wine_data[property_name].min(), wine_data[property_name].max(), 6
    )
    bin_labels = [
        f"{round(bin_edges[i], 2)} - {round(bin_edges[i+1], 2)}"
        for i in range(len(bin_edges) - 1)
    ]
    grouped_data["property_bins"] = grouped_data["property_bins"].map(
        lambda x: bin_labels[int(x)]
    )

    fig = px.bar(
        grouped_data,
        x="property_bins",
        y="count",
        color="quality",
        barmode="stack",
        title=f"Distribution of {property_name} vs Wine Quality",
        labels={
            "property_bins": f"{property_name} Ranges",
            "count": "Count",
            "quality": "Wine Quality",
        },
        color_continuous_scale="Viridis",
    )
    fig.update_layout(title_x=0.5)
    return fig


app.run_server(debug=False, port=8051, host="0.0.0.0")
