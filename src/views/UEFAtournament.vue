<template lang='pug'>
  div
    .banner
      .img-gradient
        .banner-trophy
    .intro.pl-5.pr-5
      p
        | Design Reference : 
        a(href="https://www.uefa.com/uefachampionsleague/" target="_blank") UEFA Homepage
        <br>
        | Visaulization Tool : D3.js
    .tounament-wrapper
      svg#root

</template>
<style lang='scss' scoped>
  .img-gradient {
    height: 200px;
    width: 100%;
    background-image: linear-gradient(to top,#00004b,60%,rgba(0,0,0,0));
  }
  .banner {
    background-image: url("../assets/images/UEFA/banner.jpg");
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    height: 200px;
  }
  .banner-trophy {
    overflow: auto;
    background-image: url("../assets/images/UEFA/logo_small.svg");
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 70% 70%;
    height: 200px;
    width: 100%;
  }
  .intro {
    background-color: #00004b;
    color: white;
  }
  .tounament-wrapper {
    background-image: url("../assets/images/UEFA/ucl-bg-header.jpg");
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    overflow: scroll;
  }
  .fight {
    .highlight rect { 
      fill:pink !important;
    }
  }
</style>
<script>
import * as d3 from 'd3';

export default {
  data() {
    return {
      InterviewData: null,
      roundNames: null,
      distance: {
        svg: {
          width: 1260,
          height: 1260,
          top: 10,
          bottom: 10,
          right: 10,
          left: 10
        },
        round: {
          width: null,
          height: null,
          marginRight: null,
          fontSize: null,
        },
        pathHeight: 0
      },
      uiElements: {
        rootSvg: null
      },
      currentHoveredUserBoxes: [],
      currentHoveredUserPaths: []
    }
  },
  async mounted() {
    console.log('App Load')
    await this.fetchData()
    await this.initRootSvg()
    await this.initRoundBanner()
    await this.initTounament()
  }, 
  methods: {
    fetchData(){
      this.InterviewData = require('@/../data/UEFA-tournament.json')
    },
    initRootSvg() { // svg 크기 조절
      this.uiElements.rootSvg = d3.select('#root')
        .attr('height', this.distance.svg.height)
        .attr('width', this.distance.svg.width)
      .append('g')
        .attr('transform', `translate(10, 10)`)
    },
    initRoundBanner() {
      const distance = {
        width: 300,
        height: 36,
        marginRight: 1,
        fontSize: 12
      }

      // 매치의 라운드 뽑기 [1,2,3]
      let countRound = 0
      let roundNumbers = []
      this.InterviewData.match.forEach((e) => {
        let r = e.id.r
        if(countRound !== r) {
          countRound = r
          roundNumbers.push(r)
        }
      })

      // 라운드 네이밍 변경 - Semifinals, Finals
      let roundNames = []
      roundNumbers.forEach((e) => {
          if(e == roundNumbers.length) roundNames.push("Finals")
          else if (e == roundNumbers.length-1) roundNames.push("Semifinals")
          else roundNames.push(`Round of ${16/Math.pow(2,e-1)}`)
      })
      this.roundNames = roundNames
      
      this.distance.round = distance

      const bannerGroup = this.uiElements.rootSvg.append('g')
                                                .attr('transform', `translate(0,10)`)
      const bannerItem = bannerGroup.selectAll("g")
                                    .data(roundNames)
                                    .enter()
                                  .append('g')
                                    .attr('transform', (e,i) => `translate(${distance.width*i + distance.marginRight*i}, 0)`)
                                    .attr('class', 'round')
      bannerItem.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width',distance.width)
                .attr('height',distance.height)
                .attr('fill', '#5af7dc')
      bannerItem.append('text')
                .attr('x', distance.width/2)
                .attr('y', distance.height/2)
                .attr('text-anchor','middle')
                .attr('alignment-baseline','middle')
                .attr('font-size', distance.fontSize)
                .attr('font-weight', "bold")
                .text(e => e)
    },
    initTounament() {
      const self = this
      const match = this.InterviewData.match
      const fixedMarginTop = 80
      const fixedMarginLeft = 20
      let margin = {
        top: fixedMarginTop,
        left: fixedMarginLeft,
        betweenBox:1.5
      }
      
      const numberWidth = 10
      const tournamentMarginTop = this.distance.svg.top + this.distance.round.height + margin.top;
      const tournament = this.uiElements.rootSvg.append('g')
                                              .attr('class','tournament')
                                              .attr('transform', `translate(0,${tournamentMarginTop})`)

      const fightBox = {
        height: 70,
        width: this.distance.round.width - 2 * fixedMarginLeft,
      }

      let SeedNameBox = {
        width: fightBox.width-2*fixedMarginLeft,
        height: fightBox.height/2,
        margin: 5
      }
      
      const scoreBox = {
        width: fightBox.height/2,
        height: fightBox.height/2,
        x: numberWidth + SeedNameBox.width + margin.betweenBox
      }

      const pathStrokeWidth = 2

      const color = {
        beforeHover: '#2E2F33',
        afterHover: '#3D63CC',
        champion: '#EA6247'
      }
      // Fight Box
      let currentRound = 1
      let iterateInSameRound = 0
      const fight = tournament.selectAll("g")
                              .data(match)
                              .enter()
                            .append('g')
                              .attr('class', 'fight')
                              .each(function (d, i) {
                                if(currentRound === d.id.r) {
                                  iterateInSameRound++
                                } else {
                                  currentRound = d.id.r
                                  iterateInSameRound = 1
                                }

                                // 단계가 증가할 수록 증가는 Fight 박스 사이의 간격
                                let marginHeightInEachRound = Math.pow(2, d.id.r-1) * (self.distance.round.height + fixedMarginTop)
                                let firstMarginHeightInEachRound = marginHeightInEachRound/2
                                margin.top = fixedMarginTop + firstMarginHeightInEachRound + marginHeightInEachRound/2

                                margin.left = fixedMarginLeft + (self.distance.round.width) * (currentRound-1)
                                d3.select(this).attr('transform', `translate(${margin.left}, ${firstMarginHeightInEachRound + marginHeightInEachRound*(iterateInSameRound-1)})`)
                              })
      
      // fight.append('text')
      //     .attr('class', 'number')
      //     .text((d) => d.number)
      //     .attr('x',0)
      //     .attr('y', fightBox.height/2)
      //     .attr('text-anchor','middle')
      //     .attr('alignment-baseline','middle')
      //     .attr('fill', '#8B8C8D')
      //     .attr('font-size', 10)
      
      function usernameMouseOver(e, fight, target, self) {
        const userId = d3.select(target).attr('data-user-id')
        const username = d3.select(target).text()
        let indexes = []
        fight.data().forEach((f,i) => {
          f.participant.forEach((e, j) => {
            if(e._id == userId) {
              let oppisite = j === 0 ? 1 : 0
              let isWin = f.score[j] > f.score[oppisite]
              indexes.push([i,j,isWin])
            }
          })
        })

        let currentHoveredUserBoxes = []
        let currentHoveredUserPaths = []
        
        if(indexes.length > 0 ) {
          indexes.forEach(f => {
            const upOrDownBox = f[1] === 0 ? '.upBox' : '.downBox'
            const targetBox = tournament.select(`g.fight:nth-child(${f[0]+1}) ${upOrDownBox} rect`)
                                        .attr('fill', color.afterHover)
            currentHoveredUserBoxes.push(targetBox)
            
            if(f[2]) {
              const targetPath = tournament.select(`g.fight:nth-child(${f[0]+1}) .pathToNextRound path`)
                                          .attr('stroke-width', 4)
              currentHoveredUserPaths.push(targetPath)
            }
          })
        }
        self.currentHoveredUserBoxes = currentHoveredUserBoxes
        self.currentHoveredUserPaths = currentHoveredUserPaths
      }

      function usernameMouseOut(self) {
        if(self.currentHoveredUserBoxes.length === 0) return false
        self.currentHoveredUserBoxes.forEach(e => {
          e.attr('fill', color.beforeHover)
        })
        
        self.currentHoveredUserPaths.forEach(e => {
          e.attr('stroke-width', 2)
        })
      }
      
      // upbox 설정
      const upBox = fight.append('g')
                        .attr('class', 'upBox')
                        .attr('data-user-id', (e) => e.participant[0]._id)
                        .on("mouseover", function (e) {
                          usernameMouseOver(e, fight, this, self)
                        })
                        .on("mouseout", function (e) {
                          usernameMouseOut(self)
                        })
                  
      const upSeedNameBox = upBox.append('g')
                              .attr('class', 'upSeedNameBox')
                              .attr('transform', `translate(${numberWidth},0)`)

      upSeedNameBox.append('rect')
                  .attr('width', SeedNameBox.width)
                  .attr('height', SeedNameBox.height)
                  .attr('fill', '#2E2F33')
                  .style('cursor', 'pointer')
      // upSeedNameBox.append('text')
      //             .attr('x', 10)
      //             .attr('y', SeedNameBox.height/2)
      //             .attr('font-size', 12)
      //             .attr('fill', '#304380')
      //             .attr('text-anchor','start')
      //             .attr('alignment-baseline','middle')
      //             .text((d) => d.seed[0])
      upSeedNameBox.append('image')
                  .attr('x', 10)
                  .attr('y', SeedNameBox.margin/2)
                  .attr('width', SeedNameBox.height - SeedNameBox.margin)
                  .attr('height', SeedNameBox.height - SeedNameBox.margin)
                  .attr('xlink:href', (d) => require(`@/assets/images/UEFA/${d.participant[0].name}.png`))
      upSeedNameBox.append('text')
                  .attr('class', 'username')
                  .attr('x', 10 + SeedNameBox.height)
                  .attr('y', SeedNameBox.height/2)
                  .attr('font-size', 12)
                  .attr('fill', 'white')
                  .attr('text-anchor','start')
                  .attr('alignment-baseline','middle')
                  .text((d) => d.participant[0].name)

      const upScoreBox = upBox.append('g')
                        .attr('class', 'upScoreBox')
                        .attr('transform', `translate(${scoreBox.x},0)`)
      upScoreBox.append('rect')
            .attr('class', 'score')
            .attr('width', scoreBox.width)
            .attr('height', scoreBox.height)
            .attr('fill', (d) => {
              if(d.id.r == self.roundNames.length) return d.score[0] > d.score[1] ? color.champion : color.beforeHover
              return d.score[0] > d.score[1] ? color.afterHover : color.beforeHover
            })
            .style('cursor', 'pointer')
      upScoreBox.append('text')
            .attr('text-anchor','middle')
            .attr('alignment-baseline','middle')
            .attr('x', scoreBox.width/2)
            .attr('y', scoreBox.height/2 + 1)
            .attr('font-size', 12)
            .attr('fill', 'white')
            .text((d) => Math.floor(d.score[0]))

      // down box 설정
      const downBox = fight.append('g')
                          .attr('class', 'downBox')
                          .attr('data-user-id', (e) => e.participant[1]._id)
                          .on("mouseover", function (e) {
                            usernameMouseOver(e, fight, this, self)
                          })
                          .on("mouseout", function (e) {
                            usernameMouseOut(self)
                          })
      const downSeedNameBox = downBox.append('g')
                              .attr('class', 'downSeedNameBox')
                              .attr('transform', `translate(${numberWidth},${SeedNameBox.height + margin.betweenBox})`)
      downSeedNameBox.append('rect')
                    .attr('width', SeedNameBox.width)
                    .attr('height', SeedNameBox.height)
                    .attr('fill', '#2E2F33')
                    .style('cursor', 'pointer')
      // downSeedNameBox.append('text')
      //               .attr('x', 10)
      //               .attr('y', SeedNameBox.height/2 + margin.betweenBox)
      //               .attr('font-size', 12)
      //               .attr('fill', '#304380')
      //               .attr('text-anchor','start')
      //               .attr('alignment-baseline','middle')
      //               .text((d) => d.seed[1])
      downSeedNameBox.append('image')
                  .attr('x', 10)
                  .attr('y', SeedNameBox.margin/2)
                  .attr('width', SeedNameBox.height - SeedNameBox.margin)
                  .attr('height', SeedNameBox.height - SeedNameBox.margin)
                  .attr('xlink:href', (d) => require(`@/assets/images/UEFA/${d.participant[1].name}.png`))
      downSeedNameBox.append('text')
                    .attr('class', 'username')
                    .attr('x', 10 + SeedNameBox.height)
                    .attr('y', SeedNameBox.height/2 + margin.betweenBox)
                    .attr('font-size', 12)
                    .attr('fill', 'white')
                    .attr('text-anchor','start')
                    .attr('alignment-baseline','middle')
                    .text((d) => d.participant[1].name)
      
      const downScoreBox = downBox.append('g')
                          .attr('class', 'downScoreBox')
                          .attr('transform', `translate(${scoreBox.x},0)`)
      downScoreBox.append('rect')
              .attr('class', 'score')
              .attr('y',SeedNameBox.height + margin.betweenBox)
              .attr('width', scoreBox.width)
              .attr('height', scoreBox.height)
              .attr('fill', (d) => {
                if(d.id.r == self.roundNames.length) return d.score[1] > d.score[0] ? color.champion : color.beforeHover
                return d.score[1] > d.score[0] ? color.afterHover : color.beforeHover
              })
              .style('cursor', 'pointer')
      downScoreBox.append('text')
              .attr('text-anchor','middle')
              .attr('alignment-baseline','middle')
              .attr('x', scoreBox.width/2)
              .attr('y', scoreBox.height*1.5 + margin.betweenBox + 1)
              .attr('font-size', 12)
              .attr('fill', 'white')
              .text((d) => Math.floor(d.score[1]))

      // 다음 라운드를 이어주는 Path생성
      fight.append('g')
          .attr('class', 'pathToNextRound')
          .attr('transform', `translate(${scoreBox.x},0)`)
        .append('path')
          .attr('fill', "transparent")
          .attr('stroke', "#5af7dc")
          .attr('stroke-width',pathStrokeWidth)
          .attr('d', function (d,i) {
            if(self.roundNames.length === d.id.r) {
              d3.select(this.parentNode).append('image')
                            .attr('x', scoreBox.width)
                            .attr('y', scoreBox.height/3)
                            .attr('width', 40)
                            .attr('height', 40)
                            .attr('xlink:href', require('@/assets/images/UEFA/icon-trophy.svg'))
              return
            }
            let marginHeightInEachRound = Math.pow(2, d.id.r-1) * (self.distance.round.height + fixedMarginTop) 
            let pathToDownOrUp = i%2 == 1 ? -Math.abs( + marginHeightInEachRound/2) :  + marginHeightInEachRound/2
              
            const detactedPointFromOrigin = scoreBox.height + pathStrokeWidth/2
            const curvePointFromOrign = scoreBox.width + fixedMarginLeft
            return (
              "M" + scoreBox.width + " " + detactedPointFromOrigin + 
              ' L' + curvePointFromOrign + " " + detactedPointFromOrigin +
              " M" + curvePointFromOrign + " " + detactedPointFromOrigin +
              ' L' + curvePointFromOrign + " " + (detactedPointFromOrigin + pathToDownOrUp) +
              " M" + curvePointFromOrign + " " + (detactedPointFromOrigin + pathToDownOrUp) +
              ' L' + (scoreBox.width + fixedMarginLeft*2 + 2) + " " + (detactedPointFromOrigin + pathToDownOrUp)
            )
          })
    },
  }
}
</script>

