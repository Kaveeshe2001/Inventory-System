package com.pension.PIMS.response;

import lombok.Data;

@Data
public class ApiResponse {
	private String message;
	private String data;
	
	public ApiResponse(String message, String data) {
		super();
		this.message = message;
		this.data = data;
	}
}
