<template lang="pug">
  div
    #clickTooltip1
    #clickTooltip2
    #tooltip1
    #tooltip2
    div.pt-5.pb-5.mt-4
      .mobile-toggle-wrapper
        .form-location-wrapper.desktop-ds-none
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
              b-form-group
                b-form-radio-group(v-model="adrr_params"
                          @input="adrrChanged(adrr_params)"
                          :options="adrrOptions"
                          name="addr")
              
      br
    
      .row
        .col-md-6.without_side_pd
          .upperline
          h4.subtitle 대기오염물질
          div(ref="airMap", id="airMap")
          
          br
        .col-md-6.without_side_pd
          .upperline
          h4.subtitle 전체 사망 위험
          div(ref="adrrMap", id="adrrMap")
      .bottomForMobileView
</template>
<script>
  const mapFunc = require("@/models/mapFunc")
  const sdVal = require("@/models/sdVal")
  const mapData = require("@/../data/municipalities-topo-simple.json")
  const airpol_data = require("@/../data/airpol.json")
  const all_death_d3_data = require("@/../data/all_death_d3.json")
  const all_death_bar_chart_data = require("@/../data/all_death_bar_chart_data.json")

  export default {
    data () {
      return {
        locaOptions: [
          {value: "none", text: "전국"},
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
        locaOptionsSelected: "none",
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
        clicked_area: null,
        
        get_sd: null,
        get_sgg: null, 
        airpol_params: null,
        adrr_params: null,
      }
    },
    created () {
        this.get_sd = mapFunc.getSearchQueryParam("sd");
        this.get_sgg = mapFunc.getSearchQueryParam("sgg");
        this.airpol_params = mapFunc.getSearchQueryParam("airpol") || "PM2_5";
        this.adrr_params = mapFunc.getSearchQueryParam("adrr") || "RR";
    },
    mounted () {
      this.scale = this.$refs.airMap.clientWidth * 6;
      this.width = this.$refs.airMap.clientWidth;
      this.height = this.width;

      this.projection = d3.geo.mercator()
        .center([128, 36])
        .scale(this.scale)
        .translate([this.width/2, this.height/2]);

      this.path = d3.geo.path()
        .projection(this.projection);

      this.clickTooltip1 = d3.select('#clickTooltip1')
        .attr('class', 'hidden fd-tooltip');

      this.clickTooltip2 = d3.select('#clickTooltip2')
        .attr('class', 'hidden fd-tooltip');

      d3.select('#tooltip1')
        .attr('class', 'hidden fd-tooltip');

      d3.select('#tooltip2')  
        .attr('class', 'hidden fd-tooltip');
      
      this.changeAdRrMap(this.airpol_params, this.adrr_params);
      this.changeAirMap(this.airpol_params, this.adrr_params);
      
      var clicked_adrr = this.clicked_area ? document.getElementById("adrr_" + k.properties.code) : null,
        clicked_ap = this.clicked_area ? document.getElementById(k.properties.code) : null;

      var k = topojson.feature(this.geoJsonData, this.geoJsonData.objects["municipalities-geo"]).features.find((g) => g.properties.code === mapFunc.getSearchQueryParam("sgg"));

      if(k) {
        this.magnifyMap(k, d3.select("#airpolGroup"), d3.select("#adrrGroup"), 0);
        
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
        this.clicked_area = k.properties.code
        clicked_adrr = adrr;
        clicked_ap = ap;
        
        this.changeLocationInfoBoxInMap("locationInfoBox1", k.properties.code, k.properties.name, this.airpol_params, this.adrr_params)
        this.changeLocationInfoBoxInMap("locationInfoBox2", k.properties.code, k.properties.name, this.airpol_params, this.adrr_params)
      }

      // 지역 input창만 선택시 확인
      if (this.get_sd != "none" && this.get_sgg == "none") {
        var d = topojson.feature(this.geoJsonData, this.geoJsonData.objects["municipalities-geo"]).features.find((g) => g.properties.code.substring(0,2) == this.get_sd && g.properties.name == codeToCenterLocation[g.properties.code.substring(0,2)])
        var x, y, k;
        x = this.path.centroid(d)[0]
        y = this.path.centroid(d)[1]
        // 서울(11)은 시군구 크기가 작아서 더 크게 확대
        if (["11", "21", "26"].includes(this.get_sd))  {
          k = 10;
        } else if (["29", "24", "22", "25"].includes(this.get_sd)){
          k = 15;
        } else {
          k = 4;
        }
        
        // 지도 확대
        if(d3.select("#airpolGroup")) {
          d3.select("#airpolGroup").transition()
            .duration(0)
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");
        }
        if ( d3.select("#adrrGroup")) {
          d3.select("#adrrGroup").transition()
            .duration(0)
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");
        }
      }
    },
    methods: {
      adrrChanged(ap) {
        // 위험도/사망자 수 변경시 적용
        this.get_sd = mapFunc.getSearchQueryParam("sd");
        this.get_sgg = mapFunc.getSearchQueryParam("sgg"); 
        this.airpol_params = mapFunc.getSearchQueryParam("airpol") || "PM2_5";
        this.adrr_params = ap;

        this.changeAirMap(this.airpol_params, this.adrr_params);
        this.changeAdRrMap(this.airpol_params, this.adrr_params);
        
        mapFunc.changeLocationSearchParams("adrr", ap);
        
        var k = topojson.feature(this.geoJsonData, this.geoJsonData.objects["municipalities-geo"]).features.find((g) => g.properties.code === mapFunc.getSearchQueryParam("sgg"))
        if(k) {
          var clicked_adrr = this.clicked_area ? document.getElementById("adrr_" + k.properties.code) : null,
            clicked_ap = this.clicked_area ? document.getElementById(k.properties.code) : null;

          this.magnifyMap(k, d3.select("#airpolGroup"), d3.select("#adrrGroup"), 0, "onlymap");
          
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
        this.adrr_params = mapFunc.getSearchQueryParam("adrr") || "RR"; 
        this.changeAirMap(this.airpol_params, this.adrr_params);
        this.changeAdRrMap(this.airpol_params, this.adrr_params);

        mapFunc.changeLocationSearchParams("airpol", this.airpol_params);
        
        var k = topojson.feature(this.geoJsonData, this.geoJsonData.objects["municipalities-geo"]).features.find((g) => g.properties.code === mapFunc.getSearchQueryParam("sgg"))
        if(k) {

          var clicked_adrr = this.clicked_area ? document.getElementById("adrr_" + k.properties.code) : null,
            clicked_ap = this.clicked_area ? document.getElementById(k.properties.code) : null;

          this.magnifyMap(k, d3.select("#airpolGroup"), d3.select("#adrrGroup"), 0, "onlymap");
          
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
        var location_value = los;
        var airpol = mapFunc.getSearchQueryParam("airpol") || "PM2_5";
        var adrr = mapFunc.getSearchQueryParam("adrr") || "RR"; 
        mapFunc.changeLocationSearchParams("sd", location_value != "none" ? location_value.substring(0,2) : "none");
        mapFunc.changeLocationSearchParams("sgg", "none");
        mapFunc.changeLocationSearchParams("airpol", airpol);
        mapFunc.changeLocationSearchParams("adrr", adrr);
        
        var d = topojson.feature(this.geoJsonData, this.geoJsonData.objects["municipalities-geo"]).features.find((g) => g.properties.code.substring(0,2) == location_value && g.properties.name == sdVal.codeToCenterLocation[g.properties.code.substring(0,2)])
        
        var x, y, k;

        if (d) {
          x = this.path.centroid(d)[0]
          y = this.path.centroid(d)[1]
          // 서울(11)은 시군구 크기가 작아서 더 크게 확대
          if (["11", "21", "26"].includes(location_value))  {
            k = 10;
          } else if (["29", "24", "22", "25"].includes(location_value)){
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
      },
      // Hover 시 tooltip 변경
      changeHoverToolTip(d, tl, sideLocation, t, r) {
        var tooltip1 = d3.select("#tooltip1");
          tooltip1.text("")
          tooltip1.attr("class", "fd-tooltip hover")
            .style("top", (tl.top + window.scrollY) + "px")
            .style("left", tl.right + 5 + "px")
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
      // 클릭시 지역확대
      magnifyMap(d, g1, g2, ac, control) {
        var sd = d.properties.code.substring(0,2);
        var x, y, k, centroid;

        if(control) { 
          centroid = this.path.centroid(d);
          x = centroid[0];
          y = centroid[1];
          // 서울(11)은 시군구 크기가 작아서 더 크게 확대
          if (["11", "21", "26"].includes(sd))  {
            k = 10;
          } else if (["29", "24", "22", "25"].includes(sd)){
            k = 15;
          } else {
            k = 4;
          }
          this.centered = d;
        } else if (this.centered && this.centered.properties.name === d.properties.name) {
          x = this.width / 2;
          y = this.height / 2;
          k = 1;
          this.centered = null;
        } else {
          centroid = this.path.centroid(d);
          x = centroid[0];
          y = centroid[1];
          // 서울(11)은 시군구 크기가 작아서 더 크게 확대
          if (["11", "21", "26"].includes(sd))  {
            k = 10;
          } else if (["29", "24", "22", "25"].includes(sd)){
            k = 15;
          } else {
            k = 4;
          }
          this.centered = d;
        }
        
        // 지도 확대
        if(g1) {
          g1.transition()
            .duration(ac)
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");
        }
        if(g2) {
          g2.transition()
            .duration(ac)
            .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");
        }
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
        // 상세보기 버튼
        var vertical_button_padding = 10;
        var horizontal_button_padding = 12;
        var linkBox = locationInfoBox.append("g");
        var linkBoxRect = linkBox.append("rect")
          .attr("y", (box_font_size + box_font_padding * 3) * 1)
          .attr("height", (box_font_size + vertical_button_padding * 2) + "px")
          .attr("class", "signal_bg_color")
          .style("cursor", "pointer")
          .on("click", function(){
            window.location = window.location.origin + "/data-visualization/finedust/sgg?sd=" + String(dc).substring(0,2) + "&sgg=" + dc + "&airpol=" + t + "&adrr=" + r ;
          });
        var linkBoxText = linkBox.append("text")
          .attr("class", "link")
          .attr("y", (box_font_size + vertical_button_padding) * 2 + "px")
          .attr("x", vertical_button_padding)
          .style({
            "font-size": box_font_size + "px",
            "cursor": "pointer",
            "fill": "white",
            "pointer-events": "none"
          })  
          .text("상세보기 ");
        var linkBoxText_bound = linkBoxText.node().getBoundingClientRect();
        linkBox.append("text")
          .attr("x", vertical_button_padding + linkBoxText_bound.width + 5)
          .attr("y", (box_font_size + vertical_button_padding) * 2 + "px")
          .style({
            "font-family": "FontAwesome",
            "font-size": box_font_size + 2 + "px",
            "cursor": "pointer",
            "fill": "white",
            "pointer-events": "none"
          }) 
          .text(function(d) { return '>'; }); 

        linkBoxRect.attr("width", linkBoxText_bound.width + vertical_button_padding * 2 + 10)
        
        d3.select("#" + id + " .locationInfoBoxWrapper")
          .attr("width", function(){return locationInfoBox.node().getBoundingClientRect().width + legend_mg*2})
          .attr("height", locationInfoBox.node().getBoundingClientRect().height + legend_mg*2)
      },
      // 공기오염도 지도 변경
      changeAirMap(t, r, l) {
        this.get_sd = mapFunc.getSearchQueryParam("sd");
        this.get_sgg = mapFunc.getSearchQueryParam("sgg"); 
        // 해당 토픽의 통계값 가
        
        var topicStat = sdVal.sdAirPolStat[t];

        d3.select("#airMap").select("svg").remove();

        var svg1 = d3.select("#airMap").append("svg")
          .attr("width", this.width)
          .attr("height", this.height);

        var quantize = d3.scale.quantize()
          .domain([Math.floor(topicStat.min), Math.ceil(topicStat.max)])
          .range(d3.range(5).map(function(i) { 
            if (i != undefined) {return "p" + i; }
          }));
        
        var that = this;

        ready(this.geoJsonData);
        
        function ready(d) {
          
          var features = topojson.feature(d, d.objects["municipalities-geo"]).features;
          
          features.forEach(function(d) {
            d.properties.value = airpol_data.find((item) => item.SGG_CD == d.properties.code)[t];
            d.properties.quantized = quantize(d.properties.value);
          });

          var adrr, ap, bar, sideLocation, tl;
          var map_g = svg1.append("g").attr("id", "airpolGroup")
          
          map_g.selectAll("path")
            .data(features)
            .enter().append("path")
            .attr("class", function(d) { 
              return "municipality " + d.properties.quantized + " sdGroup" + d.properties.code.substr(0,2); 
            })
            .on('mouseenter', function(d) {
              tl = d3.select(this).node().getBoundingClientRect()
              sideLocation = document.getElementById("adrr_" + d.properties.code).getBoundingClientRect()            
              
              that.changeHoverToolTip(d, tl, sideLocation, t, r)
              
              adrr = document.getElementById("adrr_" + d.properties.code);
              ap = document.getElementById(d.properties.code);
              adrr.classList.add("hover");
              ap.classList.add("hover");
            })
            .on('mouseleave', function(d) {
              var tooltip1 = d3.select("#tooltip1");
              var tooltip2 = d3.select("#tooltip2");

              tooltip1.attr("class", "fd-tooltip hidden")
              tooltip2.attr("class", "fd-tooltip hidden")

              adrr.classList.remove("hover");
              ap.classList.remove("hover");
              d3.select("#airMap").select("svg").selectAll(".sdGroup" + d.properties.code.substr(0,2))
                .classed("sdHover", false)
              d3.select("#adrrMap").select("svg").selectAll(".sdGroup" + d.properties.code.substr(0,2))
                .classed("sdHover", false)
            })
            .on('click', function(d){
              that.magnifyMap(d, d3.select("#airpolGroup"), d3.select("#adrrGroup"), 750);
              
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
      changeAdRrMap(t, r, sd, sgg){  
        this.get_sd = mapFunc.getSearchQueryParam("sd");
        this.get_sgg = mapFunc.getSearchQueryParam("sgg"); 

        // 해당 토픽의 통계값 가져오기
        var topicStat = sdVal.sdAdrrStat[t];

        d3.select("#adrrMap").select("svg").remove();

        // var svg1 = d3.select("#airMap").append("svg");
        var svg2 = d3.select("#adrrMap").append("svg")
          .attr("width", this.width)
          .attr("height", this.height);
        
        var quantize = d3.scale.quantize()
          .domain([topicStat[r + "Min"], topicStat[r + "Max"]])
          .range(d3.range(5).map(function(i) { 
            if (i != undefined) {return "a" + i; }
          }));
        
        var that = this;

        ready(this.geoJsonData);

        function ready(d) {
          var features = topojson.feature(d, d.objects["municipalities-geo"]).features;
          features.forEach(function(d) {
          d.properties.value = (all_death_d3_data.find((item) => item.SGG_CD == d.properties.code)[t + "__" + r])
          d.properties.quantized = quantize(d.properties.value);
          });
          
          var adrr, ap, bar, tl, sideLocation;

          var map_g = svg2.append("g").attr("id", "adrrGroup")
          
          map_g.selectAll("path")
            .data(features)
            .enter().append("path")
            .attr("class", function(d) { return "municipality " + d.properties.quantized + " sdGroup" + d.properties.code.substr(0,2); })
            .on('mouseenter', function(d) {
              tl = d3.select(this).node().getBoundingClientRect()
              sideLocation = document.getElementById(d.properties.code).getBoundingClientRect()

              that.changeHoverToolTip(d, tl, sideLocation, t, r) 

              adrr = document.getElementById("adrr_" + d.properties.code);
              ap = document.getElementById(d.properties.code);
              adrr.classList.add("hover");
              ap.classList.add("hover");
            })
            .on('mouseleave', function(d) {
              var tooltip1 = d3.select("#tooltip1");
              var tooltip2 = d3.select("#tooltip2");
              tooltip1.attr("class", "fd-tooltip hidden")
              tooltip2.attr("class", "fd-tooltip hidden")
              
              adrr.classList.remove("hover");
              ap.classList.remove("hover");
              
              d3.select("#airMap").select("svg").selectAll(".sdGroup" + d.properties.code.substr(0,2))
                .classed("sdHover", false)  
              d3.select("#adrrMap").select("svg").selectAll(".sdGroup" + d.properties.code.substr(0,2))
                .classed("sdHover", false)
            })
            .on('click', function(d){
              that.magnifyMap(d, d3.select("#airpolGroup"), d3.select("#adrrGroup"), 750);
              
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
      }
    }
  }
</script>

