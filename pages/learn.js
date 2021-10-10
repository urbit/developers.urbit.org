import React from 'react'
import Head from 'next/head'
import matter from 'gray-matter'
import { decode } from 'html-entities'
import Layout from '../components/Layout'
import Container from '../components/Container'
import Section from '../components/Section'
import SingleColumn from '../components/SingleColumn'
import Markdown from '../components/Markdown'

export default function DynamicPage ({ parsed, data }) {
  return (
    <Layout>
      <Head>
        <title>{data.title} &bull; Urbit Developers</title>
      </Head>
      <Container>
        <SingleColumn>
          <Section>
            <h1>{data.title}</h1>
          </Section>
          <Section>
            <div
              className="prose lg:prose-lg"
              dangerouslySetInnerHTML={{ __html: decode(parsed) }}
            />
          </Section>
        </SingleColumn>
        <SingleColumn>
          <Section>
            <div className="prose lg:prose-lg">
              <h2 id="urbit-101">Urbit 101</h2>
            </div>
          </Section>
        </SingleColumn>
        <div className="px-8 lg:px-16 grid gap-8 lg:grid-cols-2 2xl:grid-cols-4 prose">
          {data.courses.map((course, i) => {
            if (course.course === 'Urbit 101') {
              return (
                <div className="px-8 rounded-xl bg-wall-100" key={course.link}>
                  <h3>
                    <a href={course.link}>{course.title}</a>
                  </h3>
                  <p>{course.description}</p>
                  <p className="text-sm uppercase tracking-wide">
                    {course.duration}
                  </p>
                </div>
              )
            }
            return false
          })}
        </div>
        <SingleColumn>
          <Section>
            <div className="prose lg:prose-lg">
              <h2 id="urbit-201">Urbit 201</h2>
              <p>
                Equipped with knowledge of the basics of all parts of the stack,
                there are a number of additional supplementary tutorials and
                guides to deepen your knowledge:
              </p>
            </div>
          </Section>
        </SingleColumn>
        <div className="px-8 lg:px-16 grid gap-8 lg:grid-cols-2 2xl:grid-cols-4 prose pb-16">
          {data.courses.map((course, i) => {
            if (course.course === 'Urbit 201') {
              return (
                <div className="px-8 rounded-xl bg-wall-100" key={course.link}>
                  <h3>
                    <a href={course.link}>{course.title}</a>
                  </h3>
                  <p>{course.description}</p>
                  <p className="text-sm uppercase tracking-wide">
                    {course.duration}
                  </p>
                </div>
              )
            }
            return false
          })}
        </div>
      </Container>
    </Layout>
  )
}

export const getServerSideProps = async ({ context }) => {
  const source = require('../content/learn.page.md')
  const { content, data } = matter(source.default)
  const parsed = await Markdown(content)

  return {
    props: {
      parsed,
      data
    }
  }
}
