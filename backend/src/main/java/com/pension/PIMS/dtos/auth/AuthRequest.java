package com.pension.PIMS.dtos.auth;

public record AuthRequest (
		String username,
		String password
){
}