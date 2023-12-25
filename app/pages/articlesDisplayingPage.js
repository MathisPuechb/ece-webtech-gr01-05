import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useSupabaseClient } from '@supabase/auth-helpers-react';

import { useRouter } from "next/router";

const PostListPage = () => {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPostId, setEditPostId] = useState(null);
  const supabase = useSupabaseClient();
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) {
          console.error("Error fetching posts:", error.message);
        } else {
          setPosts(data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error.message);
      }
    };

    fetchPosts();
  }, []);

  const handleSearch = () => {
    const filteredPosts = posts.filter((post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setPosts(filteredPosts);
  };

  const resetSearch = async () => {
    setSearchQuery("");
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching posts:", error.message);
    } else {
      setPosts(data);
    }
  };

  const handleEdit = (postId, content) => {
    setEditPostId(postId);
    setEditContent(content);
  };

  const handleSaveEdit = async () => {
    try {
      const currentPost = posts.find((post) => post.id_article === editPostId);
  
      if (!currentPost) {
        console.error("Post not found for editing");
        return;
      }
  
      const updatedPost = {
        id_article: currentPost.id_article,
        title: currentPost.title, 
        content: editContent,
        user_ID: currentPost.user_ID, 
        created_at: currentPost.created_at, 
      };
  
      const { error } = await supabase.from("posts").upsert([updatedPost]);
  
      if (error) {
        throw error;
      }
  
      const updatedPosts = posts.map((post) =>
        post.id_article === editPostId ? { ...post, content: editContent } : post
      );
  
      setPosts(updatedPosts);
  
      setEditPostId(null);
      setEditContent("");
    } catch (error) {
      console.error("Error updating post:", error.message);
    }
  };
  
  
  

  return (
    <Layout>
      <div>
        <h2>Post List</h2>
        <div style={{ marginBottom: "16px" }}>
          <center>
            <input
              type="text"
              placeholder="Search by title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <button onClick={resetSearch}>Reset</button>
          </center>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Content</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id_article} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "8px" }}>{post.title}</td>
                <td style={{ padding: "8px" }}>
                  {editPostId === post.id_article ? (
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                  ) : (
                    post.content
                  )}
                </td>
                <td style={{ padding: "8px" }}>
                  {editPostId === post.id_article ? (
                    <button onClick={handleSaveEdit}>Save</button>
                  ) : (
                    <button onClick={() => handleEdit(post.id_article, post.content)}>
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default PostListPage;
