import pandas as pd
from dash import Dash, dcc, html, Input, Output
import plotly.express as px

wine_data = pd.read_csv("./data/combined_wine_quality.csv")

app = Dash(__name__)

columns = wine_data.select_dtypes(include="number").columns

app.layout = html.Div(
    [
        html.H1(
            "Wine Quality Dataset Interactive Visualization",
            style={"textAlign": "center"},
        ),
        html.Div(
            [
                html.Div(
                    [
                        html.Label("Select X-axis Variable:"),
                        dcc.Dropdown(
                            id="x-axis",
                            options=[{"label": col, "value": col} for col in columns],
                            value="pH",
                            clearable=False,
                        ),
                    ],
                    style={"width": "48%", "display": "inline-block"},
                ),
                html.Div(
                    [
                        html.Label("Select Y-axis Variable:"),
                        dcc.Dropdown(
                            id="y-axis",
                            options=[{"label": col, "value": col} for col in columns],
                            value="citric acid",
                            clearable=False,
                        ),
                    ],
                    style={"width": "48%", "display": "inline-block"},
                ),
            ]
        ),
        dcc.Graph(id="scatter-hex-plot", style={"height": "70vh"}),
    ]
)


@app.callback(
    Output("scatter-hex-plot", "figure"),
    [Input("x-axis", "value"), Input("y-axis", "value")],
)
def update_plot(x_axis, y_axis):
    fig = px.density_heatmap(
        wine_data,
        x=x_axis,
        y=y_axis,
        nbinsx=30,
        nbinsy=30,
        color_continuous_scale="Blues",
        title=f"{x_axis} vs {y_axis}",
    )
    fig.update_layout(title_x=0.5)
    return fig


if __name__ == "__main__":
    # Save the HTML file first
    app.write_html("./arav_visualizations/pair_interactive_site.html")
    # Then run the server
    app.run_server(debug=False, port=8050, host="0.0.0.0")
