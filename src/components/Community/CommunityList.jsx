import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Request from '../../functions/common/Request';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import SearchBlack from "../../assets/img/search_black.svg";
import CommunityUpload from "./CommunityUpload";
import qs from 'qs';
import OtherUserData from '../../functions/common/OtherUserData';
const Section = styled.div`
  height: 53vh;
  position: relative;
`
const ListWrapper = styled.div`
  border-top: 1px rgba(0,0,0,0.5) solid;
`
const List = styled.div`
  display: flex;
  text-align: center;
  height: 8vh;
  align-items: center;
  padding: 2% 0;
  border-bottom: 1px rgba(0,0,0,0.5) solid;
  width: 100%;
  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
  }
`
const Title = styled.div`
  width: 50%;
`
const Info = styled.div`
  width: 15%;
`
const Writer = styled.div`
  width: 20%;
`
const CommunityWriter = styled(Writer)`
  cursor: pointer;
  &:hover {
    color: #00AFFF;
  }
` 
const CreatedAt = styled.div`
  width: 20%;
`
const UploadButton = styled.div`
  width: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5vh 0;
  background-color: #9DF4CD;
  border-radius: 10px;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  position: absolute;
  right:0;
  bottom: 0;
  @media screen and (max-width: 768px) {
    width: 20%;
  }
  &:hover {
    transform : scale(1.03);
  }
`
const StyledLink = styled(Link)`
  width: 50%;
  color: #000000;
  text-decoration: none;
  cursor: pointer;
  &:hover{
    color: #0064FF;
  }
`
const SearchFilterBar = styled.div`
  position: relative;
  width: 60%;
  margin: 5vh auto;
  @media screen and (max-width: 768px) {
    width: 95%;
  }
`
const HashtagListWrapper = styled.div`
  position: absolute;
  width: 100%;
  z-index:3;
`
const HashtagList = styled.div`
  width: 95%;
  margin: 0 auto;
  background-color: rgba(0,0,0,0.5);
  color: #FFFFFF;
  padding: 5%;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`
export default function CommunityList({ board, format }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const request = Request(navigate);
  const [mode, setMode] = useState(false);
  const [otherUser, setOtherUser] = useState({});
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);
  const [listHashtag, setListHashtag] = useState([]);
  const location = useLocation();
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageOneFlag, setPageOneFlag] = useState(false);
  const queryString = qs.parse(location.search, {
    ignoreQueryPrefix: true
  });
  const getItem = async () => {
    setLoading(true);
    const response = await request.get("/community/posts/", {
      board: board,
      query: queryString.search,
      query_type: 'default',
      page: queryString.page,
      latest: 'true',
    }, null);
    setList(response.data.data.results);
    setTotal(response.data.data.count);
    setLoading(false);
  }

  const onChangeSearch = (e) => {
    if (format.supportsHashtags) {
      if (e.target.value[0] == '#') {
        if (e.target.value.slice(1).length == 0) {
          setListHashtag([]);
        }
        else {
          getHashTag(e.target.value.slice(1));
        }
      }
    }
    setTempSearch(e.target.value);
  };
  const handleSearchToggle = async (e) => {
    if (e) {
      e.preventDefault();
    }
    !tempSearch ? setSearch('') : setSearch(tempSearch);
      //검색어 없을 경우 전체 리스트 반환
  };

  const otherUserData = async (email) => {
    const response = await request.get('/mypage/user/', {
      email: email
    });
    setOtherUser(response.data.data);
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const getHashTag = async (search) => {
    const response = await request.get("/community/post_hashtags", {
      board: board,
      query: search,
    })
    setListHashtag(response.data.data.results);
  }
  const getItemHashtag = async (search) => {
    setListHashtag([]);
    setLoading(true);
    const response = await request.get("/community/posts/", {
      board: board,
      query: search,
      query_type: 'hashtag',
      page: queryString.page,
    }, null);
    setList(response.data.data.results);
    setTotal(response.data.data.count);
    setLoading(false);
  }
  useEffect(() => {
    const params = { page: page };
    if (search) params.search = search;
    
    if (location.state?.name && page === 1) {
      setSearch(location.state.name);
      location.state.name = null;
    } else if ((page===1 && search)||page !== 1) {
      setSearchParams(params);
      setPageOneFlag(true);
    } else if (page === 1 && pageOneFlag) {
      setSearchParams(params);
    }
  }, [search, page]);
  useEffect(() => {
    getItem();
    if (parseInt(queryString.page) !== page) setPage(parseInt(queryString.page));
    if (queryString.search) setTempSearch(queryString.search);
    setMode(false);
    return () => setLoading(false);
  }, [queryString.page, search, board, queryString.search]);
  return (
    <>
      {mode ?
        <CommunityUpload setMode={setMode} format={format} board={board} /> :
        <>
          <SearchFilterBar>
            <SearchBar
              search={tempSearch}
              onChangeSearch={onChangeSearch}
              handleSearchToggle={handleSearchToggle}
              placeholder="검색어를 입력하세요"
              searchIcon={SearchBlack}
              background="#FFFFFF"
              color="#000000"
            />
            <HashtagListWrapper>
              {listHashtag.map((data, index) => (
                <HashtagList onClick={()=>{getItemHashtag(data.name)}} key={index}><span>{data.name}</span><span>{data.postCount}</span></HashtagList>
              ))}
            </HashtagListWrapper>
          </SearchFilterBar>
          <Section>
            <ListWrapper>
            {open && <OtherUserData open = {open} userData = {otherUser} handleClose = {handleClose}/>}
              <List>
                <Title>제목</Title>
                <Info>좋아요/댓글</Info>
                <Writer>작성자</Writer>
                <CreatedAt>등록일</CreatedAt>
              </List>
              {
                list.map((data, index) => (
                  <List key={index}>
                    <StyledLink to={`/community/${board}/${data.id}?page=1`}>
                      {data.title}
                    </StyledLink>
                    <Info>
                      {data.likeCount}
                      -
                      {data.commentCount}</Info>
                    <CommunityWriter onClick={() => {otherUserData(data.email)}}>{data.nickname}</CommunityWriter>
                    <CreatedAt>{data.created.slice(0, 10)}</CreatedAt>
                  </List>
                ))
              }
            </ListWrapper>
            <UploadButton
              onClick={() => { setMode(true) }}
            >
              글쓰기
            </UploadButton>
          </Section>
          <Pagination total={total} limit="5" page={page} setPage={setPage} />
        </>
      }
    </>
  )
}
