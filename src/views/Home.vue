<template lang="pug">
  .main-container
    section.space--sm
      .container
        .row.justify-content-center
          .col-md-10.col-lg-8
            .masonry.masonry-blog-list
              .masonry__container.masonry--active(style='position: relative; height: 2909.87px;')
                article.masonry__item.filter-web-design(data-masonry-filter='Web Design' style='position: absolute; left: 0px; top: 0px;')
                  .article__title.text-center
                    a(href='#')
                      h2 Building an online audience
                    span May 2nd 2016 in 
                    span
                      a(href='#') Web Design
                  // end article title
                  .article__body
                    a(href='#')
                      img(alt='Image' src='img/blog-1.jpg')
                    p
                      | Co-working SpaceTeam fund big data prototype prototype long shadow latte big data. Innovate affordances personas user centered design paradigm user centered design innovate quantitative vs. qualitative pivot thought leader viral paradigm cortado affordances.
                    a(href='#') Continue reading &raquo;
                // end item
                article.masonry__item.filter-announcements(data-masonry-filter='Announcements' style='position: absolute; left: 0px; top: 897px;')
                  .article__title.text-center
                    a(href='#')
                      h2 Introducing Stack for enterprise
                    span May 1st 2016 in 
                    span
                      a(href='#') Announcements
                  // end article title
                  .article__body
                    p
                      | Co-working SpaceTeam fund big data prototype prototype long shadow latte big data. Innovate affordances personas user centered design paradigm user centered design innovate quantitative vs. qualitative pivot thought leader viral paradigm cortado affordances.
                    a(href='#') Continue reading &raquo;
                // end item
                article.masonry__item.filter-education(data-masonry-filter='Education' style='position: absolute; left: 0px; top: 1362px;')
                  .article__title.text-center
                    a(href='#')
                      h2 Exciting updates to Stack.Ed
                    span May 1st 2016 in 
                    span
                      a(href='#') Education
                  // end article title
                  .article__body
                    a(href='#')
                      img(alt='Image' src='img/blog-single-2.jpg')
                    p
                      | Innovate affordances personas user centered design paradigm user centered design innovate quantitative vs. qualitative pivot thought leader viral paradigm cortado affordances.
                    a(href='#') Continue reading &raquo;
                // end item
                article.masonry__item.filter-web-design(data-masonry-filter='Web Design' style='position: absolute; left: 0px; top: 2012px;')
                  .article__title.text-center
                    a(href='#')
                      h2 Building a site for your business
                    span April 10th 2016 in 
                    span
                      a(href='#') Web Design
                  // end article title
                  .article__body
                    a(href='#')
                      img(alt='Image' src='img/inner-5.jpg')
                    p
                      | Co-working SpaceTeam fund big data prototype prototype long shadow latte big data. Innovate affordances personas user centered design paradigm user centered design innovate quantitative vs. qualitative pivot thought leader viral paradigm cortado affordances.
                    a(href='#') Continue reading &raquo;
      .container
        .row
          .col-md-6
            img.logo(alt='Image' src='img/logo-dark.png')
            ul.list-inline.list--hover
              li.list-inline-item
                a(href='#')
                  span.type--fine-print Get Started
              li.list-inline-item
                a(href='#')
                  span.type--fine-print help@stack.io
          .col-md-6.text-right.text-center-xs
            ul.social-list.list-inline.list--hover
              li.list-inline-item
                a(href='#')
                  i.socicon.socicon-google.icon.icon--xs
              li.list-inline-item
                a(href='#')
                  i.socicon.socicon-twitter.icon.icon--xs
              li.list-inline-item
                a(href='#')
                  i.socicon.socicon-facebook.icon.icon--xs
              li.list-inline-item
                a(href='#')
                  i.socicon.socicon-instagram.icon.icon--xs
        // end of row
        .row
          .col-md-6
            p.type--fine-print
              | Supercharge your web workflow
          .col-md-6.text-right.text-center-xs
            span.type--fine-print
              | &copy;
              span.update-year 2019
              |  Stack Inc.
            a.type--fine-print(href='#') Privacy Policy
            a.type--fine-print(href='#') Legal
        // end of row
      // end of container

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

export default class Home extends Vue {}
</script>
