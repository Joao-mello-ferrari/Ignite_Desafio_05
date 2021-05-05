import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../../services/prismic';
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import styles from './post.module.scss';
import { RichText } from 'prismic-dom';

interface Content{
  heading: string;
  body: { text: string; }[];
}

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: Content[]
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  let readingDuration = 0

  if(post){
    let wordsArray = []
   
    post.data.content.map(item=>{
      const headingArray = item.heading.split(' ')
      const bodyArray = RichText.asText(item.body).split(' ')
      
      wordsArray.push(...headingArray, ...bodyArray)
    })
    readingDuration = Math.ceil(wordsArray.length/200)
  }
  
  return post ? (
    <main className={styles.postContainer}>
      <h6>Carregando...</h6>  
      <img src={post.data.banner.url} alt={post.data.title}/>
      <section className={styles.contentContainer}>
        <h1>{post.data.title}</h1>
        <div className={styles.info}>
          <div>
            <FiCalendar color='#BBBBBB'/>
            <span>
              {format(
                new Date(post.first_publication_date),
                "d MMM y",
                { locale: ptBR, }
              )}
            </span>
          </div>
          <div>
            <FiUser color='#BBBBBB'/>
            <span>{post.data.author}</span>
          </div>
          <div>
            <FiClock color='#BBBBBB'/>
            <span>{readingDuration} min</span>
          </div>
        </div>

        <section className={styles.content}>
          {post.data.content.map(item=>{
            return(
              <div key={item.heading}>
                <h2>{item.heading}</h2>
                <div dangerouslySetInnerHTML={{__html: RichText.asHtml(item.body)}}/>
                {/* <div dangerouslySetInnerHTML={{__html: item.body[1].text}}/> */}
              </div>
            )
          })}
        </section> 
      </section>
    </main>  
  ):(
    <h1 style={{margin: '5rem 0 0 5rem', color: '#F8F8F8'}}>
      Carregando...
    </h1>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [ Prismic.Predicates.at('document.type', 'posts') ], 
    // { pageSize: 1}
  );
 
  const paths = posts.results.map(post=>{
    return {
      params:{
        // slug: `/post/${post.uid}`
        slug: post.uid
      }
    }
  })  

  return{
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { uid, data, first_publication_date } = await prismic.getByUID('posts', String(params.slug), {});
  
  const newContent: Content[]  = data.content.map(item=>{
    return {
      // body: [
      //   { text: RichText.asText(item.body) },
      //   { text: RichText.asHtml(item.body) },
      // ],
      body: item.body,
      heading: item.heading,
    }
  })

  const post = {
    uid,
    first_publication_date,
    data:{
      title: data.title,
      subtitle: data.subtitle,
      author: data.author,
      banner: { url: data.banner.url, },
      content: newContent
    }
  }
  
  return{
    props:{
      post
    },
    revalidate: 60 * 60 * 24 // 1 day
  }
};
