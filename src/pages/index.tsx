import { GetStaticProps } from 'next';
// import Header from '../components/Header';

import { FiCalendar, FiUser } from 'react-icons/fi'

import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'

import styles from './home.module.scss';
import { useState } from 'react';
import { useRouter } from 'next/router';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)
  const [nextPage, setNextPage] = useState<string | null>(postsPagination.next_page)
  
  const router = useRouter()

  async function newFetch(){
    const response =  await fetch(nextPage)
    const data = await response.json()
    
    const newPosts = data.results.map(post=>{
      return{
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    })

    setPosts([...posts, ...newPosts])
    setNextPage(data.next_page)
  }

  return(
    <main className={styles.container}>
      <div className={styles.postsContainer}>
        {posts.map(post=>{
          return(
            <a key={post.uid} href={`/post/${post.uid}`}>
              <h1 onClick={()=>{router.push(`/post/${post.uid}`, '', {})}}>
                {post.data.title}
              </h1>
              <p>{post.data.subtitle}</p>
              <div>
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
              </div>
            </a>
          )
        })}

        { nextPage && 
          <button type="button" onClick={newFetch} className={styles.newPostsButotn}>
            Carregar mais posts
          </button>
        }
      </div>
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const prismicResponse = await prismic.query([
    Prismic.Predicates.at('document.type','posts')
  ], { 
      // pageSize : 1, 
      // page : 1 
    });
    
  const posts = prismicResponse.results.map(post=>{
    return{
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  })


  return{
    props:{
      postsPagination:{
        next_page: prismicResponse.next_page,
        results: posts,
      }
    }
  }
};
