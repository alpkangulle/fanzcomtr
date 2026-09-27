'use client';
import {createContext,useContext} from 'react';
import {emptyCatalog,type ArtistCatalog} from '@/lib/artist-catalog-types';
export const ArtistCatalogContext=createContext<ArtistCatalog>(emptyCatalog);
export function useArtistCatalog(){return useContext(ArtistCatalogContext);}
