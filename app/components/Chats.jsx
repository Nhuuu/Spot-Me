import React, { Component } from 'react';
import {Link} from 'react-router-dom'
import store from '../store'
import {fetchChats, postChat} from '../reducers/chats'
import axios from 'axios'

export default class Chats extends Component {
    constructor() {
        super();
        this.state = store.getState();
        this.handlePlaylistSubmit = this.handlePlaylistSubmit.bind(this);
    }

    componentDidMount(){
        const chatThunk = fetchChats();
        store.dispatch(chatThunk);
        this.unsubscribe = store.subscribe(() => this.setState(store.getState()));
    }
  
    componentWillUnmount () {
      this.unsubscribe();
    }

    handlePlaylistSubmit(e) {
        e.preventDefault();
        const likesNeeded = e.target.playlistLikesNeeded.value
    
        let jsonData = {
          name: e.target.playlistName.value,
          public: false,
          description: e.target.playlistDescription.value
          };
    
          // Send the entered data to create a playlist in spotify and the database
          axios({
            method: 'post',
            url: `https://api.spotify.com/v1/users/${this.state.userReducer.SpotifyId}/playlists`,
            data: jsonData,
            dataType: 'json',
            headers: {
                  'Authorization': 'Bearer ' + this.state.userReducer.accessToken,
                  'Content-Type': 'application/json'
            }})
              .then(res => {
                const data = {
                  name: res.data.name,
                  externalUrl: res.data.external_urls.spotify,
                  playlistId: res.data.id,
                  userId: this.state.userReducer.id,
                  likesNeeded: likesNeeded
                }
                const postChatThunk = postChat(data)
                store.dispatch(postChatThunk)
              })
      }

    render() {
        const filteredChats = [];
        for (var i = 0; i < this.state.chats.length; i++) {
            for (var j = 0; j < this.state.chats[i].members.length; j++) {
                console.log('CHATS: ', this.state.chats[i].members[j].userId, "   ", this.state.userReducer.id)
                if (this.state.chats[i].members[j].userId == this.state.userReducer.id ) {
                    filteredChats.push(this.state.chats[i]);
                }
            }
        }
        return(
        <div>
            <h1>List of chats you are a part of:</h1>
            <div className="row">
                {filteredChats.map(chat => (
                    <div className='col-lg-4' key={chat.id}>
                        <Link to={`/chats/${chat.id}`}>
                            <h2>{chat.name}</h2>
                        </Link>
                        <a href={`${chat.externalUrl}`}>Check out the playlist</a>
                        
                    </div>
                ))} 
            </div>
            <Link to={'/newchat'}>
                <button className='btn btn-info'>Make a new chat/playlist</button>
            </Link>
        </div>
        )
    }
}