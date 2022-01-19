
import './App.css';
import { MenuItem, Select, FormControl } from "@mui/material";
import {Card, CardContent} from '@mui/material';
import { useState, useEffect } from 'react';
import Infobox from './Infobox';
import Table from './Table';
import {sortData, prettyPrintStat} from './util.js'
import numeral from "numeral";
import LineGraph from "./LineGraph";
import Map from "./Map";
import "leaflet/dist/leaflet.css";

function App() {

  const [countries, setCountries]  = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
   fetch("https://disease.sh/v3/covid-19/all").then(res => res.json())
   .then((data) => {
     setCountryInfo(data);
     
   })

  }, [])

  useEffect(() => {
   const getCountriesdata = async () => {
     await fetch("https://disease.sh/v3/covid-19/countries").then((res) => res.json())
     .then((data) => {
        const countries = data.map((country) => ({
          name : country.country,
          value : country.countryInfo.iso2,
          
        }));
        const sortedData = sortData(data);
        setCountries(countries);
        setTableData(sortedData);
        setMapCountries(data);
     })
   };
   getCountriesdata();
  }, []);

  const onCountryChange = async (e) =>{
    const countryCode = e.target.value;
    console.log(countryCode);

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url).then((res) => res.json()).then((data) => {
      setCountryInfo(data);
      setCountry(countryCode);
      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })


    
  }

  return (
   
    <div className="App">
      <div className="app_left">  
        <div className="app_header">
          <h1>COVID 19 Tracker</h1>
          <FormControl className="app_dropdown">
            <Select variant = "outlined" value ={country} onChange={onCountryChange}>
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map((country) => 
                (<MenuItem value={country.value}>{country.name}</MenuItem>
                ))
              }

            
            </Select>
          </FormControl>
      
        </div>
        <div className="app_body">
          <Infobox onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}/>
          <Infobox onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")} />
          <Infobox onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}/>
        </div>
        <Map
          countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app_right">
        <CardContent>
          <div className="app_information">
            <h3>Live Cases by Country</h3>
            <Table countries={tableData}/>
            <h3>Worldwide {casesType}</h3>
            <LineGraph casesType={casesType} />
          </div>
        </CardContent>
      </Card>

        
    </div>
  );
}

export default App;
