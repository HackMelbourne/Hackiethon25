import { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Typography } from "@mui/material";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/journal/history")
      .then(history => setHistory(history.data))
      .catch(err => {
        console.error("Failed to fetch journal history:", err);
        setHistory([]);
      });
  }, []);

  return (
    <>
      <Typography mb={2}>Journal History (Last 5 Records)</Typography>
      {Array.isArray(history) && history.map((entry, index) => (
        <Grid container
        columns={4}
        spacing={1}
        key={index}
        sx={{
          borderBottom: "1px solid #444",
          paddingY: 1,
        }}>
            <Grid item size={1}>
                <Typography fontSize="8.5px" key={index} noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis", display:"block" }}>{entry.timestamp}</Typography>
            </Grid>
            <Grid item size={1}>
                <Typography fontSize="8.5px" key={index} noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis", display:"block" }}>
                    ⭐ {entry.rating}
                </Typography>
            </Grid>
            <Grid item size={1}>
                <Typography fontSize="8.5px" key={index} noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis", display:"block" }}>
                    {entry.currGoal}
                </Typography>
            </Grid>
            <Grid item size={1}>
                <Typography fontSize="8.5px" key={index} noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis", display:"block" }}>
                    {entry.highlight}
                </Typography>
            </Grid>
        </Grid>
      ))}
    </>
  );
}
