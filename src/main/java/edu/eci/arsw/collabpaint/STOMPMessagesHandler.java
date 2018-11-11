/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.collabpaint;

import edu.eci.arsw.collabpaint.model.Point;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 *
 * @author dbeltran
 */
@Controller
public class STOMPMessagesHandler {
	
	@Autowired
	SimpMessagingTemplate msgt;
    
        ConcurrentHashMap<String, ConcurrentLinkedQueue<Point>> serverPointsPolygon = new ConcurrentHashMap<>();
        
	@MessageMapping("/newpoint.{numdibujo}")    
	public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
            System.out.println("Nuevo punto recibido en el servidor!:"+pt);
            
            if (!serverPointsPolygon.containsKey(numdibujo)) {
                ConcurrentLinkedQueue<Point> pointsPolygon = new ConcurrentLinkedQueue<>();
                serverPointsPolygon.putIfAbsent(numdibujo, pointsPolygon);
            }
            
            serverPointsPolygon.get(numdibujo).add(pt);
            msgt.convertAndSend("/topic/newpoint." + numdibujo, pt);
            
            if (serverPointsPolygon.get(numdibujo).size() >= 4) {
                msgt.convertAndSend("/topic/newpolygon." + numdibujo, serverPointsPolygon.get(numdibujo));
            }
	}
}
