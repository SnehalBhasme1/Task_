package com.learning.spring.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.learning.spring.entity.Task;


	public interface TaskRepository extends JpaRepository<Task, Long> {
	}
