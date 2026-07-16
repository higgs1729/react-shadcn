"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export interface CommentThreadComment {
  id: string
  author: string
  avatarUrl?: string
  body: string
  timestamp: string
}

export interface CommentThreadProps {
  comments: CommentThreadComment[]
  replyValue: string
  onReplyChange: (value: string) => void
  onSubmitReply: () => void
}

export function CommentThread({
  comments,
  replyValue,
  onReplyChange,
  onSubmitReply,
}: CommentThreadProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar size="sm">
              {comment.avatarUrl && (
                <AvatarImage src={comment.avatarUrl} alt={comment.author} />
              )}
              <AvatarFallback>
                {comment.author.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {comment.timestamp}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.body}</p>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex-col items-stretch gap-2 border-t">
        <Textarea
          aria-label="Write a reply"
          placeholder="Write a reply..."
          value={replyValue}
          onChange={(e) => onReplyChange(e.target.value)}
        />
        <Button
          className="self-end"
          disabled={replyValue.trim().length === 0}
          onClick={onSubmitReply}
        >
          Reply
        </Button>
      </CardFooter>
    </Card>
  )
}
