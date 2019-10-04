<template lang="pug">
  div
    #clickTooltip1
    #clickTooltip2
    #tooltip1
    #tooltip2
    #tooltip3
    div.pt-5.pb-5.pr-5.pl-5.mt-4
      .mobile-toggle-wrapper
        .form-location-wrapper
          .row
            .col-sm-2
            .col-sm-8.without_side_pd
              form.text-center
                b-form-select#location.custom-select(v-model="locaOptionsSelected", 
                                  @input="locationChange(locaOptionsSelected)",
                                  :options="locaOptions")

        .form-wrapper.toggleDown.mt-4
          .row
            .col-sm-2.form-border-bottom
            .col-sm-8.without_side_pd
              #airPolTab
                form
                  b-form-radio-group(id="radios2" name="airf")
                    ul.nav.nav-tabs.justify-content-center
                      li.nav-item.col-4.without_side_pd.text-center
                        a.nav-link.airPolTab(:class="{ active: airpol_params == 'PM2_5'}", @click.prevent="airPolActiveLink('PM2_5')")
                          | PM&nbsp;
                          sub.underText 2.5
                      li.nav-item.col-4.without_side_pd.text-center
                        a.nav-link.airPolTab(:class="{ active: airpol_params == 'PM10'}", @click.prevent="airPolActiveLink('PM10')")
                          | PM&nbsp;
                          sub.underText 10
                      li.nav-item.col-4.without_side_pd.text-center
                        a.nav-link.airPolTab(:class="{ active: airpol_params == 'NO2'}", @click.prevent="airPolActiveLink('NO2')")
                          | NO&nbsp;
                          sub.underText 2
            .col-sm-2.form-border-bottom
        .row
          .col-12.subform
            #addrForm.mt-4
              form.text-center
                b-form-group.mg-btm-0
                  b-form-radio-group(v-model="adrr_params"
                            @input="adrrChanged(adrr_params)"
                            :options="adrrOptions"
                            name="addr")
              
        br
      
      .row
        .col-md-6.without_side_pd
          .upperline
          h4.subtitle 대기오염물질
          #airMap(ref="airMap")
          
          br
        .col-md-6.without_side_pd
          .upperline
          h4.subtitle 전체 사망 위험
          #adrrMap(ref="adrrMap")
      .row
        .col-md-12.without_side_pd
          .upperline
          h4.subtitle#barGraphTitle 지역별 상대 위험도 or 지역별 초과 사망자수
          #barChart(ref="barChart")
      .bottomForMobileView
</template>

<script>
  const mapFunc = require("@/models/mapFunc")
  const sdVal = require("@/models/sdVal")
  const sggAdrrStat = require("@/../data/sggAdrrStat.json")
  const sggAirPolStat = require("@/../data/sggAirPolStat.json")
  const mapData = require("@/../data/municipalities-topo-simple.json")
  const airpol_data = require("@/../data/airpol.json")
  const all_death_d3_data = require("@/../data/all_death_d3.json")
  const all_death_bar_chart_data = require("@/../data/all_death_bar_chart_data.json")

  export default {
    data () {
      return {
        locaOptions: [
          {value: "11", text: "서울특별시"},
          {value: "21", text: "부산광역시"},
          {value: "22", text: "대구광역시"},
          {value: "23", text: "인천광역시"},
          {value: "24", text: "광주광역시"},
          {value: "25", text: "대전광역시"},
          {value: "26", text: "울산광역시"},
          {value: "29", text: "세종특별자치시"},
          {value: "31", text: "경기도"},
          {value: "32", text: "강원도"},
          {value: "33", text: "충청북도"},
          {value: "34", text: "충청남도"},
          {value: "35", text: "전라북도"},
          {value: "36", text: "전라남도"},
          {value: "37", text: "경상북도"},
          {value: "38", text: "경상남도"},
          {value: "39", text: "제주특별자치도"}
        ],
        locaOptionsSelected: "11",
        adrrOptions: [
          {text: "상대위험도", value: "RR"},
          {text: "초과 사망자수", value: "ad"}
        ],
        scale: null,
        width: null,
        height: null,

        projection: null,
        path: null,
        clickTooltip1: null,
        clickTooltip2: null,
        clicked_adrr: null,
        clicked_ap: null,
        adrr: null, 
        ap: null, 
        clicked_adrr: null, 
        clicked_ap: null,
        centered: null,
        locationInfoBox: null,
        geoJsonData: mapData,
        // geoJsonData: null,
        clicked_area: null,
        
        get_sd: null,
        get_sgg: null, 
        airpol_params: null,
        adrr_params: null,
        urlSGGValue: null,
      }
    },
    created () {
      if(["none", false, undefined].includes(mapFunc.getSearchQueryParam("sd"))) {
        mapFunc.changeLocationSearchParams("sd", "11");
        this.get_sd = "11"

      } else {
        this.get_sd = mapFunc.getSearchQueryParam("sd");
        this.locaOptionsSelected = this.get_sd;
      }

      if(["none", false, undefined].includes(mapFunc.getSearchQueryParam("adrr"))) {
        mapFunc.changeLocationSearchParams("adrr", "RR");
        this.adrr_params = "RR";
      } else {
        this.adrr_params = mapFunc.getSearchQueryParam("adrr");
      }
      if(["none", false, undefined].includes(mapFunc.getSearchQueryParam("airpol"))) {
        mapFunc.changeLocationSearchParams("airpol", "PM2_5");
        this.airpol_params = "PM2_5";
      } else {
        this.airpol_params = mapFunc.getSearchQueryParam("airpol");
      }
      this.get_sgg = mapFunc.getSearchQueryParam("sgg");
    },
    mounted () {
      this.scale = this.$refs.airMap.clientWidth * 6;
      this.width = this.$refs.airMap.clientWidth;
      this.height = this.width;

      
      this.clickTooltip1 = d3.select('#clickTooltip1')
        .attr('class', 'hidden fd-tooltip');

      this.clickTooltip2 = d3.select('#clickTooltip2')
        .attr('class', 'hidden fd-tooltip');

      d3.select('#tooltip1')
        .attr('class', 'hidden fd-tooltip');

      d3.select('#tooltip2')  
        .attr('class', 'hidden fd-tooltip');

      d3.select('#tooltip3')
        .attr('class', 'hidden fd-tooltip');

      // this.axios.get('/sgg_map', {params: {sd_cd: mapFunc.getSearchQueryParam("sd")}})
      //   .then(res => {
      //     console.log("------res.data.result : ", res.data.result)
      //     // this.geoJsonData = res.data.result;
      //     this.changeAdRrMap(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));
      //     this.changeAirMap(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));
      //     this.drawBarChart(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));
      //   })
      //   .catch(e => {
      //     console.log(e)
      //   })
  
      this.changeAdRrMap(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));
      this.changeAirMap(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));
      this.drawBarChart(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));

      var clicked_adrr = this.clicked_area ? document.getElementById("adrr_" + k.properties.code) : null,
        clicked_ap = this.clicked_area ? document.getElementById(k.properties.code) : null;
    },
    methods: {
      adrrChanged(ap) {
        // 위험도/사망자 수 변경시 적용
        this.get_sd = mapFunc.getSearchQueryParam("sd");
        this.get_sgg = mapFunc.getSearchQueryParam("sgg"); 
        this.airpol_params = mapFunc.getSearchQueryParam("airpol");
        this.adrr_params = ap;

        this.changeAirMap(this.airpol_params, this.adrr_params, this.get_sd);
        this.changeAdRrMap(this.airpol_params, this.adrr_params, this.get_sd);
        this.drawBarChart(this.airpol_params, this.adrr_params, this.get_sd);
        
        mapFunc.changeLocationSearchParams("adrr", ap);
        
        var k = this.geoJsonData.features.find((g) => g.properties.code === mapFunc.getSearchQueryParam("sgg"))
        if(k) {
          var clicked_adrr = this.clicked_area ? document.getElementById("adrr_" + k.properties.code) : null,
            clicked_ap = this.clicked_area ? document.getElementById(k.properties.code) : null;

          var adrr = document.getElementById("adrr_" + k.properties.code),
            ap = document.getElementById(k.properties.code);
          adrr.classList.add("hover");
          ap.classList.add("hover")
          adrr.classList.toggle("selected")
          ap.classList.toggle("selected");
          if (clicked_adrr && clicked_adrr != adrr){
            clicked_adrr.classList.remove("selected");
            clicked_ap.classList.remove("selected");
          }
          clicked_adrr = adrr;
          clicked_ap = ap;
          
          this.changeLocationInfoBoxInMap("locationInfoBox1", k.properties.code, k.properties.name, this.airpol_params, this.adrr_params)
          this.changeLocationInfoBoxInMap("locationInfoBox2", k.properties.code, k.properties.name, this.airpol_params, this.adrr_params)
        }
      },
      airPolActiveLink(linkIdent) {
        this.airpol_params = this.airpol_params === linkIdent ? null : linkIdent;
        this.airPolChange(linkIdent);
      },
      airPolChange(ap) {
        // 대기오염 변경시 적용
        this.get_sd = mapFunc.getSearchQueryParam("sd");
        this.get_sgg = mapFunc.getSearchQueryParam("sgg"); 
        this.airpol_params = ap;
        this.adrr_params = mapFunc.getSearchQueryParam("adrr"); 

        this.changeAirMap(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));
        this.changeAdRrMap(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));
        this.drawBarChart(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));

        mapFunc.changeLocationSearchParams("airpol", this.airpol_params);
        
        var k = this.geoJsonData.features.find((g) => g.properties.code === mapFunc.getSearchQueryParam("sgg"))
        if(k) {
          var clicked_adrr = this.clicked_area ? document.getElementById("adrr_" + k.properties.code) : null,
            clicked_ap = this.clicked_area ? document.getElementById(k.properties.code) : null;
          
          var adrr = document.getElementById("adrr_" + k.properties.code),
          ap = document.getElementById(k.properties.code);
          adrr.classList.add("hover");
          ap.classList.add("hover")
          adrr.classList.toggle("selected")
          ap.classList.toggle("selected");
          if (clicked_adrr && clicked_adrr != adrr){
            clicked_adrr.classList.remove("selected");
            clicked_ap.classList.remove("selected");
          }
          clicked_adrr = adrr;
          clicked_ap = ap;
          
          this.changeLocationInfoBoxInMap("locationInfoBox1", k.properties.code, k.properties.name, this.airpol_params, this.adrr_params)
          this.changeLocationInfoBoxInMap("locationInfoBox2", k.properties.code, k.properties.name, this.airpol_params, this.adrr_params)
        }
      },
      // 지역 값 변경 폼
      locationChange(los) {
        this.locaOptionsSelected = los;
        this.airpol_params = mapFunc.getSearchQueryParam("airpol");
        this.adrr_params = mapFunc.getSearchQueryParam("adrr"); 
        
        mapFunc.changeLocationSearchParams("sd", (los != "none" ? los.substring(0,2) : "none"));
        mapFunc.changeLocationSearchParams("sgg", "none");
        mapFunc.changeLocationSearchParams("airpol", this.airpol_params);
        mapFunc.changeLocationSearchParams("adrr", this.adrr_params);
        

        var features = topojson.feature(this.geoJsonData, this.geoJsonData.objects["municipalities-geo"]).features;
        var d = features.find((g) => g.properties.code.substring(0,2) == los && g.properties.name == sdVal.codeToCenterLocation[g.properties.code.substring(0,2)])
        
        var x, y, k;

        if (d) {
          x = this.path.centroid(d)[0]
          y = this.path.centroid(d)[1]
          // 서울(11)은 시군구 크기가 작아서 더 크게 확대
          if (["11", "21", "26"].includes(los))  {
            k = 10;
          } else if (["29", "24", "22", "25"].includes(los)){
            k = 15;
          } else {
            k = 4;
          }
        } else {
          x = this.width >= 450 ? 285 : 285/2;
          y = this.width >= 450 ? 285 : 285/2;
          k = 1;
        }

        // 지도 확대 
        d3.select("#airpolGroup").transition()
          .duration(750)
          .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
          .style("stroke-width", 1.5 / k + "px");
      
      
        d3.select("#adrrGroup").transition()
          .duration(750)
          .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
          .style("stroke-width", 1.5 / k + "px");
        
        this.changeAdRrMap(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));
        this.changeAirMap(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));
        this.drawBarChart(this.airpol_params, this.adrr_params, mapFunc.getSearchQueryParam("sd"));
      },
      // Hover 시 tooltip 변경
      changeHoverToolTip(d, tl, sideLocation, t, r) {
        var tooltip1 = d3.select("#tooltip1");
          tooltip1.text("")
          tooltip1.attr("class", "fd-tooltip hover")
            .style("top", (tl.top + window.scrollY) + "px")
            .style("left", (tl.right-100) + "px")
          tooltip1
            .append("span")
            .text("시도 : " +  sdVal.codeToSD[d.properties.code.substr(0,2)])
          tooltip1
            .append("br")
          tooltip1  
            .append("span")
            .text(" " + d.properties.name + " : " + parseFloat(airpol_data.find((item) => item.SGG_CD === d.properties.code)[t]).toFixed(0) + " " + mapFunc.addUnitToAirPol[t]);
        d3.select("#airMap").select("svg").selectAll(".sdGroup" + d.properties.code.substr(0,2))
          .classed("sdHover", true)

        var tooltip2 = d3.select("#tooltip2");
          tooltip2.text("")
          tooltip2.attr("class", "fd-tooltip hover")
            .style("top", (sideLocation.top + window.scrollY) + "px")
            .style("left", sideLocation.right + 5 + "px")
            .style("z-index", 999)
          tooltip2
            .append("span")
            .text("시도 : " +  sdVal.codeToSD[d.properties.code.substr(0,2)])
          tooltip2
            .append("br")
          tooltip2
            .append("span")
            .text(" " + d.properties.name + " : " + parseFloat(all_death_d3_data.find((item) => item.SGG_CD === d.properties.code)[t + "__" + r]).toFixed(0) )  
        d3.select("#adrrMap").select("svg").selectAll(".sdGroup" + d.properties.code.substr(0,2))
        //   this.svg2.selectAll(".sdGroup" + d.properties.code.substr(0,2))
          .classed("sdHover", true)
      },
      // legendbox 초기화
      initLegendBox(legend, legendQuant, svg, id){
        var legendQuantBackgroundRect = legendQuant.append("rect")
          .attr("fill", "white")
          .attr("fill-opacity","0.7")
          .style("pointer-events", "none");

        var legend_pd = 3;
        var legend_mg = 6;
        
        legendQuant.call(legend); 

        var legendInfo = legendQuant.node().getBoundingClientRect();
        
        legendQuantBackgroundRect
          .attr("width", legendInfo.width + legend_pd*2)
          .attr("height", legendInfo.height + legend_pd*2)
        legendQuant.attr("transform", "translate(" + (this.width - legendInfo.width - legend_mg) + "," + (this.height - legendInfo.height - legend_mg) + ")")        
        legendQuant.select(".legendCells")
          .attr("transform", "translate(" + legend_pd + "," + legend_pd + ")")
          .style("pointer-events", "none");

        // 지도 하단 지역설명창
        var locationInfoBox_height = 76;  
        var locationInfoBox = svg.append("g")
          .attr("id", id)
        // .attr("transform", "translate(0,0)")    
        
        locationInfoBox.append("rect")
          .attr("fill", "white")
          .attr("class", "locationInfoBoxWrapper")
          .attr("fill-opacity","0.8")
          .style("pointer-events", "none");
        locationInfoBox.append("g")
          .attr("class", "infoText")
      },
      // 상세보기 Box 변경
      changeLocationInfoBoxInMap(id, dc, dn, t, r){
        if (id == "locationInfoBox1") {
          var outputText = String(parseFloat(airpol_data.find((item) => item.SGG_CD === dc)[t]).toFixed(0))  + " " + mapFunc.addUnitToAirPol[t]
        } else if (id == "locationInfoBox2" ) {
          var outputText = mapFunc.adrrTranslate[r] + " : " + (all_death_d3_data.find((item) => item.SGG_CD === dc)[t + "__" + r])
        }
        
        var legend_mg = 6;
        // 상세보기 Box
        var locationInfoBox = d3.select("#" + id + " .infoText")
          .attr("transform", "translate(" + legend_mg + ",20)");
        var box_font_size = this.width < 460 ? 15 : 20;
        var box_font_padding = 4;
        
        locationInfoBox.selectAll("text").remove();

        locationInfoBox.append("text")
          .attr("class", "sd")
          .style("font-size", box_font_size + "px")
          .text(sdVal.codeToSD[String(dc).substring(0,2)] + " " + dn)
        locationInfoBox.append("text")
          .attr("class", "sd")
          .attr("y", (box_font_size + box_font_padding) * 1 + "px")
          .style({
            "font-size": box_font_size + "px",
            "font-weight": "bold"
          })
          .text(outputText);
        
        d3.select("#" + id + " .locationInfoBoxWrapper")
          .attr("width", function(){return locationInfoBox.node().getBoundingClientRect().width + legend_mg*2})
          .attr("height", locationInfoBox.node().getBoundingClientRect().height + legend_mg*2)
      },
      // 공기오염도 지도 변경
      changeAirMap(t, r, l) {

        this.get_sd = mapFunc.getSearchQueryParam("sd");
        this.get_sgg = mapFunc.getSearchQueryParam("sgg"); 
        
        this.projection = d3.geo.mercator()
          .center(sdVal.cd_to_nm[l].center)
          .scale(this.$refs.airMap.clientWidth * sdVal.cd_to_nm[l].scale)
          .translate([this.width/2, this.height/2]);
        
        this.path = d3.geo.path()
          .projection(this.projection);

        // 해당 토픽의 통계값 가져오기
        var topicStat = sggAirPolStat.find((item) => item.SD_CD == this.get_sd);

        d3.select("#airMap").select("svg").remove();

        var svg1 = d3.select("#airMap").append("svg")
          .attr("width", this.width)
          .attr("height", this.height);

        var range = (l == "29" ? 1 : 5)

        var quantize = d3.scale.quantize()
          .domain([Math.floor(topicStat[t + "_min"]), Math.ceil(topicStat[ t + "_max"])])
          .range(
            d3.range(range).map((i) => { 
              if (i != undefined) {return "p" + i; }
            })
          );
        
        var tooltip1 = document.getElementById("tooltip1"),
          tooltip2 = document.getElementById("tooltip2"),
          tooltip3 = document.getElementById("tooltip3"),
          that = this,
          adbc = all_death_bar_chart_data;

        ready(this.geoJsonData);
        
        function ready(d) {
          var features = topojson.feature(d, d.objects["municipalities-geo"]).features;
          
          features.forEach(function(d) {
            d.properties.value = airpol_data.find((item) => item.SGG_CD == d.properties.code)[t];
            d.properties.quantized = quantize(d.properties.value);
          });
          // console.log("features : ", features)

          var adrr, ap, bar, adbc_data;
          var map_g = svg1.append("g").attr("id", "airpolGroup")
          
          map_g.selectAll("path")
            .data(features)
            .enter().append("path")
            .attr("class", function(d) { 
              return "municipality " + d.properties.quantized + " sdGroup" + d.properties.code.substr(0,2); 
            })
            .on('mouseenter', function(d) {
              ap = document.getElementById(d.properties.code);
              adrr = document.getElementById("adrr_" + d.properties.code);
              bar = document.getElementById("bar_" + d.properties.code);

              var apd = airpol_data.find((item) => item.SGG_CD === d.properties.code)[t];
              var ad_data = all_death_d3_data.find((item) => item.SGG_CD === d.properties.code)[t + "__" + r];
              adbc_data = adbc.find((item) => item.SGG_CD === d.properties.code)
              
              that.mapMouseOverTooltip(tooltip1, ap, d.properties.code, d.properties.name, apd, t);
              that.mapMouseOverTooltip(tooltip2, adrr, d.properties.code, d.properties.name, ad_data, r);
              that.mapMouseOverDetailTooltip(bar, d, d.properties.name, t, r, adbc_data[t + "__" + r + "_U"], adbc_data[t + "__" + r], adbc_data[t + "__" + r + "_L"]);
            })
            .on('mouseleave', function(d) {
              that.tooltipMouseOut(ap, tooltip1);
              that.tooltipMouseOut(adrr, tooltip2);
              that.tooltipMouseOut(bar, tooltip3);
            })
            .on('click', function(d){
              if(adrr.classList.contains("selected") && ap.classList.contains("selected")) {
                mapFunc.changeLocationSearchParams("sd", "none");
                mapFunc.changeLocationSearchParams("sgg", "none");
                mapFunc.changeLocationSearchParams("airpol", t);
                mapFunc.changeLocationSearchParams("adrr", r);
              } else {
                mapFunc.changeLocationSearchParams("sd", d.properties.code.substr(0,2));
                mapFunc.changeLocationSearchParams("sgg", d.properties.code);
                mapFunc.changeLocationSearchParams("airpol", t);
                mapFunc.changeLocationSearchParams("adrr", r);
              }
              var clicked_adrr = this.clicked_area ? document.getElementById("adrr_" + k.properties.code) : null,
                clicked_ap = this.clicked_area ? document.getElementById(k.properties.code) : null;
              // 지도 path 클릭 효과
              adrr.classList.toggle("selected")
              ap.classList.toggle("selected");
              if (clicked_adrr && clicked_adrr != adrr){
                clicked_adrr.classList.remove("selected");
                clicked_ap.classList.remove("selected");
              }
              clicked_adrr = adrr;
              clicked_ap = ap;
              that.changeInfoBoxInBarChart(sdVal.codeToSD[d.properties.code.substr(0,2)], d.properties.name, t, r, adbc_data[t + "__" + r + "_U"], adbc_data[t + "__" + r], adbc_data[t + "__" + r + "_L"]);
              that.changeLocationInfoBoxInMap("locationInfoBox1", d.properties.code, d.properties.name, t, r)
              that.changeLocationInfoBoxInMap("locationInfoBox2", d.properties.code, d.properties.name, t, r)
            })
            .attr("d", that.path)
            .attr("id", function(d) { return d.properties.code; })
          
          var legend = d3.legend.color()
            .labelFormat(d3.format( ".0f"))
            .useClass(true)
            .scale(quantize);

          var legendQuant1 = svg1.append("g")
            .attr("id", "legendQuant1")
          that.initLegendBox(legend, legendQuant1, svg1, "locationInfoBox1")
        }
      },

      //// 위험도, 초과 사망자수 지도 변경
      changeAdRrMap(t, r, l){  
        this.get_sd = mapFunc.getSearchQueryParam("sd");
        this.get_sgg = mapFunc.getSearchQueryParam("sgg"); 

        this.projection = d3.geo.mercator()
          .center(sdVal.cd_to_nm[l].center)
          .scale(this.$refs.airMap.clientWidth * sdVal.cd_to_nm[l].scale)
          .translate([this.width/2, this.height/2]);

        this.path = d3.geo.path()
          .projection(this.projection);

        // 해당 토픽의 통계값 가져오기
        var topicStat = sggAdrrStat.find((item) =>  item.SD_CD == this.get_sd);

        d3.select("#adrrMap").select("svg").remove();

        // var svg1 = d3.select("#airMap").append("svg");
        var svg2 = d3.select("#adrrMap").append("svg")
          .attr("width", this.width)
          .attr("height", this.height);

        var max_min = [topicStat[t + "_" + r + "Max"], topicStat[ t + "_" + r + "Min"]];
        var range = 5;

        // 숫자 소숫점 단위 표시
        if (r == "RR") {
          if(l == "29") { // 세종특별시의 경우 하나밖에 없으므로
            range = 1;
          } else {
            var gap = parseInt(String((max_min[1] - max_min[0]).toFixed(10)).split(".")[1].replace(/0*/, "")[0]) 
            if ( gap < 4 ) { // 스케일 5개로 조정
            range = gap + 1;
            }
          }
        }
        
        var quantize = d3.scale.quantize()
          .domain(max_min)
          .range(
            d3.range(range).map((i) => { 
              if (i != undefined) {return "a" + i; }
            })
          );
        
        var tooltip1 = document.getElementById("tooltip1"),
          tooltip2 = document.getElementById("tooltip2"),
          tooltip3 = document.getElementById("tooltip3"),
          that = this,
          adbc = all_death_bar_chart_data;
    
        ready(this.geoJsonData);

        function ready(d) {
          // var features = d.features;
          var features = topojson.feature(d, d.objects["municipalities-geo"]).features;
          features.forEach(function(d) {
            d.properties.value = all_death_d3_data.find((item) => item.SGG_CD == d.properties.code)[t + "__" + r]
            d.properties.quantized = quantize(d.properties.value);
          });
          
          var adrr, ap, bar, adbc_data;
          var map_g = svg2.append("g").attr("id", "adrrGroup")
          
          map_g.selectAll("path")
            .data(features)
            .enter().append("path")
            .attr("class", function(d) { return "municipality " + d.properties.quantized + " sdGroup" + d.properties.code.substr(0,2); })
            .on('mouseenter', function(d) {
              adrr = document.getElementById("adrr_" + d.properties.code);
              ap = document.getElementById(d.properties.code);
              bar = document.getElementById("bar_" + d.properties.code);

              var apd = airpol_data.find((item) => item.SGG_CD === d.properties.code)[t];
              var ad_data = all_death_d3_data.find((item) => item.SGG_CD === d.properties.code)[t + "__" + r];
              
              adbc_data = adbc.find((item) => item.SGG_CD === d.properties.code)
            
              that.mapMouseOverTooltip(tooltip1, ap, d.properties.code, d.properties.name, apd, t);
              that.mapMouseOverTooltip(tooltip2, adrr, d.properties.code, d.properties.name, ad_data, r);
              that.mapMouseOverDetailTooltip(bar, d, d.properties.name, t, r, adbc_data[t + "__" + r + "_U"], adbc_data[t + "__" + r], adbc_data[t + "__" + r + "_L"]);
            })
            .on('mouseleave', function(d) {
              that.tooltipMouseOut(ap, tooltip1);
              that.tooltipMouseOut(adrr, tooltip2);
              that.tooltipMouseOut(bar, tooltip3);
            })
            .on('click', function(d){
              if(adrr.classList.contains("selected") && ap.classList.contains("selected")) {
                mapFunc.changeLocationSearchParams("sd", "none");
                mapFunc.changeLocationSearchParams("sgg", "none");
                mapFunc.changeLocationSearchParams("airpol", t);
                mapFunc.changeLocationSearchParams("adrr", r);
              } else {
                mapFunc.changeLocationSearchParams("sd", d.properties.code.substr(0,2));
                mapFunc.changeLocationSearchParams("sgg", d.properties.code);
                mapFunc.changeLocationSearchParams("airpol", t);
                mapFunc.changeLocationSearchParams("adrr", r);
              }
              var clicked_adrr = this.clicked_area ? document.getElementById("adrr_" + k.properties.code) : null,
                clicked_ap = this.clicked_area ? document.getElementById(k.properties.code) : null;
              // 지도 path 클릭 효과
              adrr.classList.toggle("selected")
              ap.classList.toggle("selected");
              if (clicked_adrr && clicked_adrr != adrr){
                clicked_adrr.classList.remove("selected");
                clicked_ap.classList.remove("selected");
              }
              clicked_adrr = adrr;
              clicked_ap = ap;

              that.changeInfoBoxInBarChart(sdVal.codeToSD[d.properties.code.substr(0,2)], d.properties.name, t, r, adbc_data[t + "__" + r + "_U"], adbc_data[t + "__" + r], adbc_data[t + "__" + r + "_L"]);
              that.changeLocationInfoBoxInMap("locationInfoBox1", d.properties.code, d.properties.name, t, r)
              that.changeLocationInfoBoxInMap("locationInfoBox2", d.properties.code, d.properties.name, t, r)
            })
            .attr("d", that.path)
            .attr("id", function(d) { return "adrr_" + d.properties.code; })
            
          var legend = d3.legend.color()
            .labelFormat(d3.format(r == "RR" ? ".3f" : ".0f"))
            .useClass(true)
            .scale(quantize);  
          var legendQuant2 = svg2.append("g")
            .attr("id", "legendQuant2")
          that.initLegendBox(legend, legendQuant2, svg2, "locationInfoBox2")
        
        
        }
      },

      drawBarChart (t, r, l) {

        d3.select("#barChart").select("svg").remove();

        var adbc = all_death_bar_chart_data;
        var barChart_width = this.$refs.barChart.clientWidth;
        var width = barChart_width > 1000 ? barChart_width : 1000;
        
        var height = width/3;
        var margin = {top: 20, right: 20, bottom: 40, left: 60};
        var svg_width = width - margin.right - margin.left;
        var svg_height = height - margin.bottom - margin.top;

        var x0 = d3.scale.ordinal().rangeBands([0, svg_width]);
        var x1 = d3.scale.ordinal();
        
        var category_min = d3.min(adbc, function(da) { return da[t + "__" + r + "_L"] });
        var category_max = d3.max(adbc, function(da) { return da[t + "__" + r + "_U"] });
        // console.log("category_min : ", category_min)
        // console.log("category_max : ", category_max)
        var y = d3.scale.linear().domain([category_min,category_max]).range([svg_height, 0]);
        // console.log("y(1) : ", y(1))
        var color = d3.scale.linear()
          .range(["#ffffe5", "#662506"]);

        // var z0 = d3.scale.ordinal().rangeBands([0,svg_width]);
        // var z1 = d3.scale.ordinal();
        var sds = adbc.map(function(d) { return d.SD_NM;});
        var sds_nm = d3.map(adbc, function(d) { return d.SD_NM;}).keys();

        // console.log(d3.map(adbc, function(d) { return d.SD_NM;}))
        // z0.domain(sds_nm)
        // z0.domain([sds])
        // z1.domain(sds).rangeBands([0, z0.rangeBand()]);
        var sd_x = [0];
        for(var i in sds_nm) {
          sd_x.push(sds.lastIndexOf(sds_nm[i]))
        }
        var z1 = d3.scale.ordinal().domain(sds).rangeRoundPoints([0,svg_width]);
        var z3 = d3.scale.linear().domain([0,250]).range([0,svg_width]);

        var zi = 0;

        var xAxis = d3.svg.axis()
          .scale(z1)
          // .scale(x0)
          .orient("bottom");

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickFormat(d3.format(r == "RR" ? ".2f" : ".0f"));
        
        // var detailBox = {height: 80};
        var detailBoxHeight = 80,
          lastScrollLeft = 0;

        var svg = d3.select("#barChart")
          .attr("width", barChart_width)
          .style("overflow-x", "auto")
        .append("svg")
          .attr("width", width)
          .attr("height", height + margin.top*2 + detailBoxHeight);
          
        // 바 그래프 상세정보
        var detail_svg = svg.append("g")
          .attr("id", "barChartDetailBox")
          .attr("transform", "translate(" + (margin.left + svg_width/2 - 50) + "," + margin.top + ")");

        // 바 그래프
        var chart_svg = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + (margin.top*2 + detailBoxHeight) + ")");

        var grid = chart_svg.append("g")     
          .attr("class", "grid")
          .call(make_y_axis()
            .tickSize(-width, 0, 0)
            .tickFormat("")
          )
          
        function make_y_axis() {
          return d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10)
        }

        var rateNames = adbc.map(function(d) { return d["SGG_CD"]; });
        
        // x축
        // console.log("d3.map(objects, function(d) { return d.SD_NM;})).keys()  : ", d3.map(adbc, function(d) { return d.SD_NM;}).keys())
        // var sd_nms = d3.map(adbc, function(d) { return d.SD_NM;}).keys();
        var sd_nms = adbc.map(function(d) { return d.SD_NM;});
        // var sd_nms = d3.map(adbc, function(d) { return d.SD_NM;}).keys();
        // x0.domain(sd_nms)
        x0.domain(["전국"]);
        // console.log("adbc.map(function(d){d.SD_NM}) : ", adbc.map(function(d){ return d.SD_NM;}).map(function(a){return a}))
        // x0.domain(adbc.map(function(d){ return d.SGG_NM}));
        x1.domain(rateNames).rangeBands([0, x0.rangeBand()]);

        chart_svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + svg_height + ")")
          .call(xAxis)
        .selectAll("g")
          .attr("transform", function(d){
            var index = sds.indexOf(d);

            if(sds[index-1]) {
              var result = z3(sds.lastIndexOf(sds[index-1]))/2 + z3(sds.lastIndexOf(d))/2;
              return "translate(" + result + ",0)";
            } else {
              return "translate(" + z3(sds.lastIndexOf(d))/2 + ",0)";
            }
          })
        .select("text")
          .text(function(t){
            // if(["경상북도", "경상남도","충청북도", "충청남도", "전라남도","전라북도", "경기도"].includes(t)){
            //   return t
            // } else {
            //   return t.substring(0,2);
            // }
            return sdVal.shortSdName[t]
          })
          .attr("transform",function(t) { 
            return "translate(13,20) rotate(90)"; 
          })

        // text label for the x axis
        chart_svg.append("text")     
          .attr(
            "transform",
            "translate(" + (width/2 + margin.right - margin.left) + " ," + 
                    (height - margin.top + 10 ) + ")")
          .style("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "bold")
          .text("지역");
        
        var slice = chart_svg.selectAll(".slice")
          .data(adbc)
          .enter().append("g")
          .attr("class", "g")
          .attr("transform",function(d) { 
            return "translate(" + x1(d.SGG_CD) + ",0)"; 
          });

        var ap, adrr, bar;
        var tooltip1 = document.getElementById("tooltip1"),
          tooltip2 = document.getElementById("tooltip2"),
          tooltip3 = document.getElementById("tooltip3"),
          that = this;
          
        slice.select("rect")
          .data(adbc)
          .enter().append("rect")
          .attr("width", x1.rangeBand())
          .attr("x", function(d) { 
            return x1(d.SGG_CD); 
          })
          .style("stroke", "black")
          .style("stroke-width", .2)
          .attr("y", function(d) { 
            return y(d[t + "__" + r + "_U"]);
          })
          .attr("height", function(d) { 
            return (y(d[t + "__" + r + "_L"]) - y(d[t + "__" + r + "_U"]))
          })
          .attr("class", function(d){
            if (l == d.SD_CD) {
              if (d.SGG_CD == String(that.get_sgg)) {
                return "sd" + d.SD_CD + " highlight" + " selected"
              } else {
                return "sd" + d.SD_CD + " highlight" 
              }
            } else {
              return "sd" + d.SD_CD
            }
          })
          .attr("id", function(d){
            return "bar_" + d.SGG_CD
          })
          .on("mouseover", function(d) {
            ap = document.getElementById(d.SGG_CD);
            adrr = document.getElementById("adrr_" + d.SGG_CD);
            bar = document.getElementById("bar_"+d.SGG_CD);
            var apd = airpol_data.find((item) => item.SGG_CD == d.SGG_CD)[t]

            var ad_data = all_death_d3_data.find((item) => item.SGG_CD === d.SGG_CD)[t + "__" + r];
            that.mapMouseOverTooltip(tooltip1, ap, d.SGG_CD, d.SGG_NM, apd, t);
            that.mapMouseOverTooltip(tooltip2, adrr, d.SGG_CD, d.SGG_NM, ad_data, r);
            that.mapMouseOverDetailTooltip(bar, d, d.SGG_NM, t, r, d[t + "__" + r + "_U"], d[t + "__" + r], d[t + "__" + r + "_L"]);
          })
          .on("mouseout", function(d) {
            that.tooltipMouseOut(ap, tooltip1);
            that.tooltipMouseOut(adrr, tooltip2);
            that.tooltipMouseOut(bar, tooltip3);
          })
          .on("click", function(d){
            var adbc_data = adbc.find((item) => item.SGG_CD === d.SGG_CD)
            that.changeInfoBoxInBarChart(d.SD_NM, d.SGG_NM, t, r, adbc_data[t + "__" + r + "_U"], adbc_data[t + "__" + r], adbc_data[t + "__" + r + "_L"]);
            that.changeLocationInfoBoxInMap("locationInfoBox1", d.SGG_CD, d.SGG_NM, t, r)
            that.changeLocationInfoBoxInMap("locationInfoBox2", d.SGG_CD, d.SGG_NM, t, r)
          })

        slice.select("circle")
          .data(adbc)
          .enter().append("circle")
          // .attr("width", x1.rangeBand())
          .attr("cx", function(d) { 
            return x1(d.SGG_CD) + x1.rangeBand()/2; 
          })
          .style("fill", function(d) { 
            return "rgba(150,150,150, 1)" 
          })
          .attr("cy", function(d) { 
            return y(eval("d." + t + "__" + r))
          })
          .attr("r", 2)
          .attr("class", function(d){
            if (l == d.SD_CD) {
            return "sd" + d.SD_CD + "_point"
            } else {
            return "sd" + d.SD_CD + "_point"
            }
          })
          .style({"pointer-events": "none"})

        // y축 중앙 그리드 라인
        if(r == "RR") {
          chart_svg.append("line")
          .attr("class", "middleLine")
          .attr("x1", x0)
          .attr("x1", width)
          .attr("y1", y(1))
          .attr("y2", y(1))
          .style("stroke", "black")
          .style("stroke-dasharray", (10, 10))
          .style("stroke-width", "1.2px")
          .style("z-index", 100)
        }
        // y축 선긋기
        var yAxis = chart_svg.append("g")
          .attr("class", "y axis")
          .style('opacity','1')
          .call(yAxis)
        yAxis.append("text")
          .attr("x", mapFunc.adrrTranslate[r].length *2)
          .attr("y", "-1em")
          .style("text-anchor", "end")
          .style('font-weight','bold')
          .text(mapFunc.adrrTranslate[r]);
          
        document.getElementById("barChart").onscroll = function() {
          yAxis.attr("transform", "translate(" + this.scrollLeft + ",0)")
        };


        // y축 단계구분선
        chart_svg.select(".grid").selectAll("line")
          .style("cursor", "pointer")
          .on("mouseenter", function(e){
            // $(this).toggleClass("line-hover")
          }).on("mouseout", function(e){
            // $(this).toggleClass("line-hover")
          })
          
        // 바그래프 정보 박스 업데이트

        var adbc = all_death_bar_chart_data;
        
        // var k = this.geoJsonData.features.find((g) => g.properties.code === String(that.get_sgg))


        var features = topojson.feature(this.geoJsonData, this.geoJsonData.objects["municipalities-geo"]).features;
        var k = features.find((g) => g.properties.code === String(that.get_sgg))



        // var adbc_data = adbc.filter((item) => {
        //     return String(item.SGG_CD) === String(k.properties.code);
        //   })[0]
        

        // changeInfoBoxInBarChart(d.SD_NM, d.SGG_NM, t, r, eval("all_death_" + t + "__" + r + "_U").get(d.SGG_CD), eval("all_death_" + t + "__" + r).get(d.SGG_CD), eval("all_death_" + t + "__" + r + "_L").get(d.SGG_CD));
        // that.changeInfoBoxInBarChart(d.SD_NM, d.SGG_NM, t, r, adbc_data[t + "__" + r + "_U"], adbc_data[t + "__" + r], adbc_data[t + "__" + r + "_L"]);
        
        if(k) {
          var adbc_data = adbc.find((item) => item.SGG_CD === k.properties.code)
          // this.changeInfoBoxInBarChart(sdVal.codeToSD[this.get_sd.substring(0,2)], k.properties.name, t, r, eval("all_death_" + t + "__" + r + "_U").get(this.get_sgg), eval("all_death_" + t + "__" + r).get(this.get_sgg), eval("all_death_" + t + "__" + r + "_L").get(this.get_sgg));
          this.changeInfoBoxInBarChart(sdVal.codeToSD[this.get_sd.substring(0,2)], k.properties.name, t, r, adbc_data[t + "__" + r + "_U"], adbc_data[t + "__" + r], adbc_data[t + "__" + r + "_L"]);
        }
      },
      
      mapMouseOverTooltip(tooltip, map_hover, sgg_cd, sgg_nm, value, topic) {
        if(map_hover) {
          var sideLocation = map_hover.getBoundingClientRect();
          
          map_hover.classList.add("hover");
          tooltip.classList.remove('hidden');
          tooltip.classList.add("hover");
          
          tooltip.style.top =  (sideLocation.bottom + (sideLocation.top - sideLocation.bottom)/2 + window.scrollY) + "px"
          tooltip.style.left = (sideLocation.left + (sideLocation.right - sideLocation.left)/2) + "px"
          tooltip.style.pointerEvents = "none";
          tooltip.innerHTML = sgg_nm + " : " + parseFloat(value).toFixed(topic == "RR" ? 3 : 0) + " " + (mapFunc.addUnitToAirPol[topic] || "")
        }
      },  
      mapMouseOverDetailTooltip(map_hover, d, name, topic, adrr, u, center, l) {
        if(map_hover) {
          var tl = map_hover.getBoundingClientRect();
          var tooltip3 = document.getElementById("tooltip3");
          map_hover.classList.add("hover");
          tooltip3.classList.remove('hidden');
          tooltip3.classList.add("hover");

          tooltip3.style.top =  (tl.top + window.scrollY )+ "px"
          tooltip3.style.left = tl.right + 3 + "px"
          tooltip3.innerHTML = 
          "지역 : " + name + "</br>" + 
          "미세먼지 변수 : " + topic + "</br>" + 
          mapFunc.adrrTranslate[adrr] + " : </br>" + 
          "&nbsp;&nbsp; U : " + u +"</br>" +
          "&nbsp;&nbsp; center : " + center + "</br>" +
          "&nbsp;&nbsp; L : " + l;
          
        }
      },
      tooltipMouseOut(target, tooltip) {
        if(target) {
          tooltip.classList.remove('hover');
          tooltip.classList.add("hidden");
          target.classList.remove("hover");
        }
      },
      // 바그래프 상세보기 Box 변경
      changeInfoBoxInBarChart(SD_NM, SGG_NM, t, r, output_U, output_center, output_L){
        var get_sgg = mapFunc.getSearchQueryParam("sgg"); 
        var font_size = 15, font_margin = 8;
        var detail_svg = d3.select("#barChart #barChartDetailBox")
        detail_svg.selectAll("text").remove()
        detail_svg.append("text")
          .style("font-size", font_size + "px")
          .text(SD_NM + " " + SGG_NM)
        detail_svg.append("text")
          .attr("x", 10)
          .attr("y", (font_margin + font_size))
          .style("font-size", font_size + "px")
          .text("U : " + output_U)
        detail_svg.append("text")
          .attr("x", 10)
          .attr("y", (font_margin + font_size)*2)
          .style("font-size", font_size + "px")
          .text("center : " + output_center)
        detail_svg.append("text")
          .attr("x", 10)
          .attr("y", (font_margin + font_size)*3)
          .style("font-size", font_size + "px")
          .text("L : " + output_L)
      }
    }
  }
</script>